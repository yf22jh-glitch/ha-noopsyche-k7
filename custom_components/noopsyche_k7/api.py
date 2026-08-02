"""Async local TCP client for Noo-Psyche K7 lights.

The protocol was recovered from the official Noo-Psyche Android application
version 2.0.3. It is an unauthenticated LAN protocol on TCP port 8266.
"""

from __future__ import annotations

import asyncio
import re
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime

from .const import DEFAULT_PORT, DEFAULT_TIMEOUT

FRAME_START = b"\xaa\xa5"
FRAME_END = b"\xbb"
RESPONSE_HEADER = b"\xab\xaa\x10\x08"

CMD_SYNC_TIME = b"\x10\x03"
CMD_CHANGE_MODE = b"\x10\x04"
CMD_HAND_LUMINANCE = b"\x10\x05"
CMD_PREVIEW_LUMINANCE = b"\x10\x06"
CMD_ALL_SET = b"\x10\x07"
CMD_ALL_READ = b"\x10\x08"
CMD_DEMONSTRATION = b"\x10\x0a"

CHANNEL_COUNT = 6
SCHEDULE_SLOT_COUNT = 24
SCHEDULE_SLOT_SIZE = 8
MAX_RESPONSE_SIZE = 4096
ACK_SETTLE_TIMEOUT = 2.0

_DEVICE_ID_PATTERN = re.compile(rb"(?:K7_Pro|K7mini)[A-Za-z0-9_-]{0,24}")


class K7Error(Exception):
    """Base Noo-Psyche K7 error."""


class K7ConnectionError(K7Error):
    """Raised when the light cannot be reached."""


class K7ProtocolError(K7Error):
    """Raised when the light returns an invalid response."""


@dataclass(frozen=True)
class ScheduleSlot:
    """One schedule point: time followed by six channel percentages."""

    hour: int
    minute: int
    channels: tuple[int, int, int, int, int, int]

    def __post_init__(self) -> None:
        """Validate the slot."""
        if not 0 <= self.hour <= 23:
            raise ValueError("Schedule hour must be between 0 and 23")
        if not 0 <= self.minute <= 59:
            raise ValueError("Schedule minute must be between 0 and 59")
        _validate_channels(self.channels)

    def to_bytes(self) -> bytes:
        """Encode the slot for the lamp."""
        return bytes((self.hour, self.minute, *self.channels))

    def as_dict(self) -> dict[str, object]:
        """Return a JSON-serializable representation."""
        return {
            "hour": self.hour,
            "minute": self.minute,
            "channels": list(self.channels),
        }


@dataclass(frozen=True)
class LampState:
    """State returned by the all-read command."""

    manual: tuple[int, int, int, int, int, int]
    schedule: tuple[ScheduleSlot, ...]
    auto_mode: bool
    device_id: str | None = None
    trailing_data: bytes = b""

    @property
    def model(self) -> str:
        """Return a friendly model inferred from the device identifier."""
        if self.device_id and self.device_id.startswith("K7mini"):
            return "K7 Mini"
        return "K7 Pro"

    def as_dict(self) -> dict[str, object]:
        """Return a JSON-serializable representation."""
        return {
            "device_id": self.device_id,
            "model": self.model,
            "auto_mode": self.auto_mode,
            "manual": list(self.manual),
            "schedule": [slot.as_dict() for slot in self.schedule],
        }


def _validate_channels(channels: Sequence[int]) -> None:
    if len(channels) != CHANNEL_COUNT:
        raise ValueError(f"Exactly {CHANNEL_COUNT} channels are required")
    if any(not 0 <= value <= 100 for value in channels):
        raise ValueError("Channel values must be between 0 and 100")


def _channel_tuple(
    channels: Sequence[int],
) -> tuple[int, int, int, int, int, int]:
    _validate_channels(channels)
    return (
        int(channels[0]),
        int(channels[1]),
        int(channels[2]),
        int(channels[3]),
        int(channels[4]),
        int(channels[5]),
    )


def build_packet(command: bytes, payload: bytes = b"") -> bytes:
    """Build one command packet."""
    if len(command) != 2:
        raise ValueError("Commands must contain exactly two bytes")
    return FRAME_START + command + payload + FRAME_END


def parse_state_response(data: bytes) -> LampState:
    """Parse an all-read response, tolerating queued acknowledgement bytes."""
    header_index = data.find(RESPONSE_HEADER)
    if header_index < 0:
        raise K7ProtocolError("The all-read response header was not found")

    position = header_index + len(RESPONSE_HEADER)
    minimum = position + CHANNEL_COUNT + 1
    if len(data) < minimum:
        raise K7ProtocolError("The all-read response is missing channel data")

    manual = _channel_tuple(data[position : position + CHANNEL_COUNT])
    position += CHANNEL_COUNT

    slot_count = data[position]
    position += 1
    if slot_count > SCHEDULE_SLOT_COUNT:
        raise K7ProtocolError(f"Invalid schedule slot count: {slot_count}")

    schedule_end = position + (slot_count * SCHEDULE_SLOT_SIZE)
    if len(data) <= schedule_end:
        raise K7ProtocolError("The all-read response is missing schedule or mode data")

    schedule: list[ScheduleSlot] = []
    for offset in range(position, schedule_end, SCHEDULE_SLOT_SIZE):
        encoded = data[offset : offset + SCHEDULE_SLOT_SIZE]
        schedule.append(
            ScheduleSlot(
                hour=encoded[0],
                minute=encoded[1],
                channels=_channel_tuple(encoded[2:8]),
            )
        )
    position = schedule_end

    auto_mode = data[position] != 0
    position += 1
    end_index = data.find(FRAME_END, position)
    if end_index < 0:
        raise K7ProtocolError("The all-read response terminator was not found")

    trailing = data[position:end_index]
    matches = _DEVICE_ID_PATTERN.findall(trailing)
    device_id = matches[-1].decode("ascii") if matches else None

    return LampState(
        manual=manual,
        schedule=tuple(schedule),
        auto_mode=auto_mode,
        device_id=device_id,
        trailing_data=trailing,
    )


class NooPsycheK7Client:
    """Local asynchronous TCP client."""

    def __init__(
        self,
        host: str,
        port: int = DEFAULT_PORT,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout
        self._lock = asyncio.Lock()

    async def async_get_state(self) -> LampState:
        """Read manual values, schedule, and mode from the light."""
        async with self._lock:
            reader, writer = await self._async_open_connection()
            try:
                writer.write(build_packet(CMD_ALL_READ))
                await writer.drain()
                response = await self._async_read_state_response(reader)
            except (OSError, TimeoutError, asyncio.IncompleteReadError) as err:
                raise K7ConnectionError(
                    f"Failed reading {self.host}:{self.port}: {err}"
                ) from err
            finally:
                writer.close()
                await writer.wait_closed()
        return parse_state_response(response)

    async def async_set_manual(self, channels: Sequence[int]) -> None:
        """Set the six manual channel values."""
        payload = bytes(_channel_tuple(channels))
        await self._async_send(CMD_HAND_LUMINANCE, payload)

    async def async_preview(self, channels: Sequence[int]) -> None:
        """Preview six channel values without changing the stored schedule."""
        payload = bytes(_channel_tuple(channels))
        await self._async_send(CMD_PREVIEW_LUMINANCE, payload)

    async def async_set_mode(self, auto_mode: bool) -> None:
        """Change between automatic and manual mode."""
        await self._async_send(CMD_CHANGE_MODE, bytes((1 if auto_mode else 0,)))

    async def async_sync_time(self, now: datetime | None = None) -> None:
        """Set the light's clock to a local wall-clock time."""
        local_now = now or datetime.now().astimezone()
        payload = bytes((local_now.hour, local_now.minute, local_now.second))
        await self._async_send(CMD_SYNC_TIME, payload)

    async def async_set_schedule(
        self,
        manual: Sequence[int],
        schedule: Sequence[ScheduleSlot],
        auto_mode: bool,
        now: datetime | None = None,
    ) -> None:
        """Overwrite the stored 24-point schedule."""
        manual_values = _channel_tuple(manual)
        if len(schedule) != SCHEDULE_SLOT_COUNT:
            raise ValueError(
                f"Exactly {SCHEDULE_SLOT_COUNT} schedule slots are required"
            )

        local_now = now or datetime.now().astimezone()
        payload = bytearray(manual_values)
        payload.append(SCHEDULE_SLOT_COUNT)
        for slot in schedule:
            payload.extend(slot.to_bytes())
        payload.append(1 if auto_mode else 0)
        payload.extend((local_now.hour, local_now.minute, local_now.second))
        await self._async_send(CMD_ALL_SET, bytes(payload))

    async def async_set_demonstration(self, enabled: bool) -> None:
        """Enable or disable the built-in day-cycle demonstration."""
        # The official app uses 0 for enabled and 1 for disabled.
        await self._async_send(CMD_DEMONSTRATION, bytes((0 if enabled else 1,)))

    async def _async_open_connection(
        self,
    ) -> tuple[asyncio.StreamReader, asyncio.StreamWriter]:
        try:
            return await asyncio.wait_for(
                asyncio.open_connection(self.host, self.port),
                timeout=self.timeout,
            )
        except (OSError, TimeoutError) as err:
            raise K7ConnectionError(
                f"Unable to connect to {self.host}:{self.port}: {err}"
            ) from err

    async def _async_send(self, command: bytes, payload: bytes = b"") -> None:
        async with self._lock:
            _reader, writer = await self._async_open_connection()
            try:
                writer.write(build_packet(command, payload))
                await writer.drain()
                # The lamp may not return its acknowledgement immediately. Keeping
                # the TCP connection open gives its firmware time to commit a write.
                await asyncio.sleep(ACK_SETTLE_TIMEOUT)
            except (OSError, TimeoutError) as err:
                raise K7ConnectionError(
                    f"Failed writing {self.host}:{self.port}: {err}"
                ) from err
            finally:
                writer.close()
                await writer.wait_closed()

    async def _async_read_state_response(
        self, reader: asyncio.StreamReader
    ) -> bytes:
        loop = asyncio.get_running_loop()
        deadline = loop.time() + self.timeout
        response = bytearray()

        while len(response) < MAX_RESPONSE_SIZE:
            remaining = deadline - loop.time()
            if remaining <= 0:
                break
            try:
                chunk = await asyncio.wait_for(
                    reader.read(MAX_RESPONSE_SIZE - len(response)),
                    timeout=remaining,
                )
            except TimeoutError:
                break
            if not chunk:
                break
            response.extend(chunk)

            header_index = response.find(RESPONSE_HEADER)
            if header_index < 0:
                continue
            count_index = header_index + len(RESPONSE_HEADER) + CHANNEL_COUNT
            if len(response) <= count_index:
                continue
            slot_count = response[count_index]
            if slot_count > SCHEDULE_SLOT_COUNT:
                raise K7ProtocolError(f"Invalid schedule slot count: {slot_count}")
            minimum_end = count_index + 1 + slot_count * SCHEDULE_SLOT_SIZE + 1
            if response.find(FRAME_END, minimum_end) >= 0:
                return bytes(response)

        if not response:
            raise K7ConnectionError("The light did not return any data")
        return bytes(response)
