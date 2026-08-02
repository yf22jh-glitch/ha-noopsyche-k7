"""Operating-mode selector for Noo-Psyche K7."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import NooPsycheK7RuntimeData
from .api import K7Error
from .const import MODE_AUTO, MODE_MANUAL
from .entity import NooPsycheK7Entity

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the operating-mode selector."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities([NooPsycheK7Mode(runtime_data.coordinator, entry)])


class NooPsycheK7Mode(NooPsycheK7Entity, SelectEntity):
    """Select automatic schedule or manual output."""

    _attr_translation_key = "operating_mode"
    _attr_options = [MODE_AUTO, MODE_MANUAL]

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "operating_mode")

    @property
    def current_option(self) -> str:
        """Return the current operating mode."""
        return MODE_AUTO if self.coordinator.data.auto_mode else MODE_MANUAL

    async def async_select_option(self, option: str) -> None:
        """Set the operating mode."""
        if option not in self.options:
            raise HomeAssistantError(f"Unsupported K7 mode: {option}")
        try:
            await self.coordinator.async_set_mode(option == MODE_AUTO)
        except K7Error as err:
            raise HomeAssistantError(f"Unable to change K7 mode: {err}") from err
