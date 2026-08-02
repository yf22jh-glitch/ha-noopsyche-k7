"""Data coordinator for Noo-Psyche K7."""

from __future__ import annotations

import logging

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

    async def _async_update_data(self) -> LampState:
        try:
            return await self.client.async_get_state()
        except K7Error as err:
            raise UpdateFailed(f"Error communicating with K7 light: {err}") from err

    async def async_set_manual(self, channels: tuple[int, ...]) -> None:
        """Set manual channels and refresh."""
        await self.client.async_set_manual(channels)
        await self.async_request_refresh()

    async def async_set_mode(self, auto_mode: bool) -> None:
        """Set operating mode and refresh."""
        await self.client.async_set_mode(auto_mode)
        await self.async_request_refresh()

    async def async_set_schedule(
        self,
        schedule: tuple[ScheduleSlot, ...],
        auto_mode: bool,
        manual: tuple[int, ...] | None = None,
    ) -> None:
        """Set the full schedule and optionally replace manual values."""
        await self.client.async_set_schedule(
            manual or self.data.manual,
            schedule,
            auto_mode,
        )
        await self.async_request_refresh()
