"""Per-channel controls for Noo-Psyche K7."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import (
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import NooPsycheK7RuntimeData
from .api import K7Error
from .const import CHANNEL_KEYS
from .entity import NooPsycheK7ManualEntity

PARALLEL_UPDATES = 1


@dataclass(frozen=True, kw_only=True)
class K7ChannelDescription(NumberEntityDescription):
    """Describe one protocol channel."""

    key: str
    index: int


CHANNELS = tuple(
    K7ChannelDescription(key=key, index=index) for index, key in enumerate(CHANNEL_KEYS)
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up channel number entities."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    async_add_entities(
        NooPsycheK7Channel(runtime_data.coordinator, entry, description)
        for description in CHANNELS
    )


class NooPsycheK7Channel(NooPsycheK7ManualEntity, NumberEntity):
    """Represent one LED channel percentage."""

    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_mode = NumberMode.SLIDER

    def __init__(
        self,
        coordinator,
        entry: ConfigEntry,
        description: K7ChannelDescription,
    ) -> None:
        super().__init__(coordinator, entry, f"channel_{description.key}")
        self.entity_description = description
        self._attr_translation_key = description.key

    @property
    def native_value(self) -> int:
        """Return the current manual value."""
        return self.coordinator.data.manual[self.entity_description.index]

    async def async_set_native_value(self, value: float) -> None:
        """Set one channel while preserving all others."""
        if not float(value).is_integer() or not 0 <= value <= 100:
            raise HomeAssistantError(
                "K7 channel percentage must be a whole number from 0 to 100"
            )
        channels = list(self.coordinator.data.manual)
        channels[self.entity_description.index] = int(value)
        try:
            await self.coordinator.async_set_manual(tuple(channels))
        except K7Error as err:
            raise HomeAssistantError(f"Unable to set K7 channel: {err}") from err
