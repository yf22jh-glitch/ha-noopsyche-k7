"""Schedule diagnostic sensor for Noo-Psyche K7."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import NooPsycheK7RuntimeData
from .const import CHANNEL_KEYS
from .entity import NooPsycheK7Entity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the schedule sensor."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities([NooPsycheK7Schedule(runtime_data.coordinator, entry)])


class NooPsycheK7Schedule(NooPsycheK7Entity, SensorEntity):
    """Expose the stored schedule as attributes."""

    _attr_translation_key = "schedule"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry, "schedule")

    @property
    def native_value(self) -> int:
        """Return the number of schedule points."""
        return len(self.coordinator.data.schedule)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        """Return channel order and all stored schedule points."""
        return {
            "channel_order": list(CHANNEL_KEYS),
            "slots": [slot.as_dict() for slot in self.coordinator.data.schedule],
        }
