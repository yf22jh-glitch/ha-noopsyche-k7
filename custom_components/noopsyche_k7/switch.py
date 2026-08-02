"""Demonstration-mode switch for Noo-Psyche K7."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import NooPsycheK7RuntimeData
from .api import K7Error
from .entity import NooPsycheK7Entity

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the demonstration-mode switch."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities([NooPsycheK7Demonstration(runtime_data.coordinator, entry)])


class NooPsycheK7Demonstration(NooPsycheK7Entity, SwitchEntity):
    """Control the lamp's accelerated day-cycle demonstration."""

    _attr_translation_key = "demonstration"
    _attr_assumed_state = True
    _attr_is_on = False

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "demonstration")

    async def async_turn_on(self, **kwargs) -> None:
        """Start demonstration mode."""
        await self._async_set_demonstration(True)

    async def async_turn_off(self, **kwargs) -> None:
        """Stop demonstration mode."""
        await self._async_set_demonstration(False)

    async def _async_set_demonstration(self, enabled: bool) -> None:
        try:
            await self.coordinator.client.async_set_demonstration(enabled)
        except K7Error as err:
            raise HomeAssistantError(
                f"Unable to change K7 demonstration mode: {err}"
            ) from err
        self._attr_is_on = enabled
        self.async_write_ha_state()
