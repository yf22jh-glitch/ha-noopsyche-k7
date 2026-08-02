"""Diagnostics support for Noo-Psyche K7."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant

from . import NooPsycheK7RuntimeData


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return redacted integration diagnostics."""
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    return {
        "entry": async_redact_data(dict(entry.data), {CONF_HOST}),
        "last_update_success": runtime_data.coordinator.last_update_success,
        "state": runtime_data.coordinator.data.as_dict(),
    }
