"""Manual-output light platform for Noo-Psyche K7."""

from __future__ import annotations

from typing import Any

from homeassistant.components.light import ATTR_BRIGHTNESS, ColorMode, LightEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import NooPsycheK7RuntimeData
from .api import K7Error
from .entity import NooPsycheK7ManualEntity

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the manual-output light."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities([NooPsycheK7Light(runtime_data.coordinator, entry)])


class NooPsycheK7Light(NooPsycheK7ManualEntity, LightEntity):
    """Represent the six manual channels as one brightness light."""

    _attr_translation_key = "manual_output"
    _attr_color_mode = ColorMode.BRIGHTNESS
    _attr_supported_color_modes = {ColorMode.BRIGHTNESS}

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "manual_output")
        self._last_nonzero: tuple[int, ...] | None = None

    @property
    def is_on(self) -> bool:
        """Return whether any manual channel is above zero."""
        return any(self.coordinator.data.manual)

    @property
    def brightness(self) -> int:
        """Return the highest channel as Home Assistant brightness."""
        return round(max(self.coordinator.data.manual) * 255 / 100)

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Restore or scale the manual output."""
        channels = self.coordinator.data.manual
        if not any(channels):
            channels = self._last_nonzero or (50, 50, 50, 50, 50, 50)

        if ATTR_BRIGHTNESS in kwargs:
            target = round(kwargs[ATTR_BRIGHTNESS] * 100 / 255)
            current_max = max(channels)
            if current_max:
                channels = tuple(
                    min(100, round(value * target / current_max))
                    for value in channels
                )
            else:
                channels = (target,) * 6

        try:
            await self.coordinator.async_set_manual(channels)
        except K7Error as err:
            raise HomeAssistantError(f"Unable to set K7 brightness: {err}") from err

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Set all manual channels to zero."""
        current = self.coordinator.data.manual
        if any(current):
            self._last_nonzero = current
        try:
            await self.coordinator.async_set_manual((0, 0, 0, 0, 0, 0))
        except K7Error as err:
            raise HomeAssistantError(f"Unable to turn off K7 output: {err}") from err
