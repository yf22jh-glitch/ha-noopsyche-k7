"""Tests for the reverse-engineered TCP protocol."""

import asyncio
from datetime import datetime

import custom_components.noopsyche_k7.api as api_module
from custom_components.noopsyche_k7.api import (
    CMD_ALL_READ,
    CMD_ALL_SET,
    CMD_CHANGE_MODE,
    CMD_DEMONSTRATION,
    CMD_PREVIEW_LUMINANCE,
    CMD_SYNC_TIME,
    FRAME_START,
    NooPsycheK7Client,
    ScheduleSlot,
    build_packet,
    parse_state_response,
)


def _schedule() -> tuple[ScheduleSlot, ...]:
    return tuple(
        ScheduleSlot(hour=hour, minute=0, channels=(hour, 20, 30, 40, 50, 60))
        for hour in range(24)
    )


def _response() -> bytes:
    payload = bytearray(b"\xab\xaa\x10\x08")
    payload.extend((10, 20, 30, 40, 50, 60))
    payload.append(24)
    for slot in _schedule():
        payload.extend(slot.to_bytes())
    payload.append(1)
    payload.extend((12, 34, 56))
    payload.extend(b"K7_Pro10021")
    payload.append(0xBB)
    return b"\xab\xaa\xa5\xa1" + bytes(payload)


def test_parse_state_response() -> None:
    state = parse_state_response(_response())

    assert state.manual == (10, 20, 30, 40, 50, 60)
    assert state.auto_mode is True
    assert state.device_id == "K7_Pro10021"
    assert len(state.schedule) == 24
    assert state.schedule[23].channels[0] == 23


def test_build_packet() -> None:
    assert build_packet(CMD_CHANGE_MODE, b"\x01") == b"\xaa\xa5\x10\x04\x01\xbb"


def test_async_read_and_schedule_write() -> None:
    async def scenario() -> None:
        received: list[bytes] = []

        async def handle(
            reader: asyncio.StreamReader, writer: asyncio.StreamWriter
        ) -> None:
            request = await reader.read(4096)
            received.append(request)
            if request == build_packet(CMD_ALL_READ):
                writer.write(_response())
                await writer.drain()
            writer.close()
            await writer.wait_closed()

        server = await asyncio.start_server(handle, "127.0.0.1", 0)
        port = server.sockets[0].getsockname()[1]
        client = NooPsycheK7Client("127.0.0.1", port, timeout=1)

        state = await client.async_get_state()
        assert state.device_id == "K7_Pro10021"

        await client.async_set_schedule(
            state.manual,
            _schedule(),
            True,
            datetime(2026, 8, 2, 17, 30, 45),
        )
        server.close()
        await server.wait_closed()

        assert received[0] == FRAME_START + CMD_ALL_READ + b"\xbb"
        assert received[1].startswith(FRAME_START + CMD_ALL_SET)
        assert len(received[1]) == 208
        assert received[1][-5:] == bytes((1, 17, 30, 45, 0xBB))

    asyncio.run(scenario())


def test_preview_demonstration_and_clock_packets() -> None:
    async def scenario() -> None:
        received: list[bytes] = []

        async def handle(
            reader: asyncio.StreamReader, writer: asyncio.StreamWriter
        ) -> None:
            received.append(await reader.read(4096))
            writer.close()
            await writer.wait_closed()

        server = await asyncio.start_server(handle, "127.0.0.1", 0)
        port = server.sockets[0].getsockname()[1]
        client = NooPsycheK7Client("127.0.0.1", port, timeout=1)
        original_settle_timeout = api_module.ACK_SETTLE_TIMEOUT
        api_module.ACK_SETTLE_TIMEOUT = 0
        try:
            await client.async_preview((1, 2, 3, 4, 5, 6))
            await client.async_set_demonstration(True)
            await client.async_set_demonstration(False)
            await client.async_sync_time(datetime(2026, 8, 2, 19, 20, 21))
        finally:
            api_module.ACK_SETTLE_TIMEOUT = original_settle_timeout
            server.close()
            await server.wait_closed()

        assert received == [
            build_packet(CMD_PREVIEW_LUMINANCE, bytes((1, 2, 3, 4, 5, 6))),
            build_packet(CMD_DEMONSTRATION, b"\x00"),
            build_packet(CMD_DEMONSTRATION, b"\x01"),
            build_packet(CMD_SYNC_TIME, bytes((19, 20, 21))),
        ]

    asyncio.run(scenario())
