"""Button platform for Noo-Psyche K7."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from . import NooPsycheK7RuntimeData
from .api import K7Error
from .entity import NooPsycheK7Entity

PARALLEL_UPDATES = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up buttons."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities([NooPsycheK7SyncTime(runtime_data.coordinator, entry)])


class NooPsycheK7SyncTime(NooPsycheK7Entity, ButtonEntity):
    """Synchronize the light clock with Home Assistant time."""

    _attr_translation_key = "sync_time"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "sync_time")

    async def async_press(self) -> None:
        """Send the current Home Assistant local time."""
        try:
            await self.coordinator.client.async_sync_time(dt_util.now())
        except K7Error as err:
            raise HomeAssistantError(f"Unable to synchronize K7 time: {err}") from err
