"""Data coordinator for Noo-Psyche K7."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import K7Error, LampState, NooPsycheK7Client, ScheduleSlot
from .const import DEFAULT_UPDATE_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class NooPsycheK7Coordinator(DataUpdateCoordinator[LampState]):
    """Coordinate polling and serialized writes to one light."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        client: NooPsycheK7Client,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=DEFAULT_UPDATE_INTERVAL,
            config_entry=entry,
        )
        self.client = client
        self._operation_lock = asyncio.Lock()

    async def _async_update_data(self) -> LampState:
        try:
            async with self._operation_lock:
                return await self.client.async_get_state()
        except K7Error as err:
            raise UpdateFailed(f"Error communicating with K7 light: {err}") from err

    async def _async_confirm(self) -> None:
        """Publish only a device read, while the operation lock is held."""
        observed = await self.client.async_get_state()
        self.async_set_updated_data(observed)

    async def async_update_manual(
        self, update: Callable[[tuple[int, ...]], tuple[int, ...]]
    ) -> tuple[int, ...]:
        """Read, derive, write and confirm one partial manual update atomically.

        The refresh debouncer is intentionally not used here: it may return
        before its read runs, or be waiting for this same operation lock.
        """
        async with self._operation_lock:
            try:
                observed = await self.client.async_get_state()
            except K7Error as err:
                self.async_set_update_error(err)
                raise
            if observed.auto_mode:
                self.async_set_updated_data(observed)
                raise K7Error("Manual output is unavailable in automatic mode")
            try:
                channels = update(observed.manual)
                await self.client.async_set_manual(channels)
                await self._async_confirm()
                return observed.manual
            except K7Error as err:
                self.async_set_update_error(err)
                raise

    async def async_set_manual(self, channels: tuple[int, ...]) -> tuple[int, ...]:
        """Set all channels; return the actual previous values after confirmation."""
        return await self.async_update_manual(lambda _current: channels)

    async def async_set_mode(self, auto_mode: bool) -> None:
        """Set operating mode and refresh."""
        async with self._operation_lock:
            try:
                await self.client.async_set_mode(auto_mode)
                await self._async_confirm()
            except K7Error as err:
                self.async_set_update_error(err)
                raise

    async def async_set_schedule(
        self,
        schedule: tuple[ScheduleSlot, ...],
        auto_mode: bool | None,
        manual: tuple[int, ...] | None = None,
    ) -> None:
        """Set the full schedule and optionally replace manual values."""
        async with self._operation_lock:
            try:
                observed = await self.client.async_get_state()
                await self.client.async_set_schedule(
                    observed.manual if manual is None else manual,
                    schedule,
                    observed.auto_mode if auto_mode is None else auto_mode,
                )
                await self._async_confirm()
            except K7Error as err:
                self.async_set_update_error(err)
                raise
