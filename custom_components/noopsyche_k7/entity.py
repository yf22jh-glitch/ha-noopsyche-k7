"""Base entity for Noo-Psyche K7."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NooPsycheK7Coordinator


class NooPsycheK7Entity(CoordinatorEntity[NooPsycheK7Coordinator]):
    """Base coordinator entity."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: NooPsycheK7Coordinator,
        entry: ConfigEntry,
        entity_key: str,
    ) -> None:
        super().__init__(coordinator)
        device_id = coordinator.data.device_id or entry.unique_id or entry.entry_id
        self._attr_unique_id = f"{device_id}_{entity_key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            manufacturer="Noo-Psyche",
            model=coordinator.data.model,
            name=coordinator.data.device_id or entry.title,
        )


class NooPsycheK7ManualEntity(NooPsycheK7Entity):
    """Base entity for controls that only apply in manual mode."""

    @property
    def available(self) -> bool:
        """Only expose manual controls while the light is in manual mode."""
        return super().available and not self.coordinator.data.auto_mode
