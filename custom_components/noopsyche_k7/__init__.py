"""Noo-Psyche K7 local integration."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import CONF_HOST, CONF_PORT, Platform
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from .api import K7Error, NooPsycheK7Client, ScheduleSlot
from .const import (
    ATTR_AUTO_MODE,
    ATTR_CHANNELS,
    ATTR_CONFIG_ENTRY_ID,
    ATTR_HOUR,
    ATTR_MANUAL,
    ATTR_MINUTE,
    ATTR_PROFILE,
    ATTR_SCHEDULE,
    ATTR_SECOND,
    DOMAIN,
    PROFILES,
    SERVICE_APPLY_PROFILE,
    SERVICE_GET_PROFILE,
    SERVICE_GET_SCHEDULE,
    SERVICE_PREVIEW,
    SERVICE_SET_SCHEDULE,
    SERVICE_SYNC_TIME,
)
from .coordinator import NooPsycheK7Coordinator
from .profiles import get_factory_profile

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [
    Platform.LIGHT,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SWITCH,
    Platform.BUTTON,
    Platform.SENSOR,
]

ENTRY_SCHEMA = vol.Schema({vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string})
CHANNELS_SCHEMA = vol.All(
    [vol.All(vol.Coerce(int), vol.Range(min=0, max=100))],
    vol.Length(min=6, max=6),
)
SET_SCHEDULE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Required(ATTR_SCHEDULE): list,
        vol.Optional(ATTR_MANUAL): CHANNELS_SCHEMA,
        vol.Optional(ATTR_AUTO_MODE): cv.boolean,
    }
)
APPLY_PROFILE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Required(ATTR_PROFILE): vol.In(PROFILES),
        vol.Optional(ATTR_AUTO_MODE, default=True): cv.boolean,
    }
)
GET_PROFILE_SCHEMA = vol.Schema({vol.Required(ATTR_PROFILE): vol.In(PROFILES)})
PREVIEW_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Required(ATTR_CHANNELS): CHANNELS_SCHEMA,
    }
)
SYNC_TIME_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Required(ATTR_HOUR): vol.All(vol.Coerce(int), vol.Range(min=0, max=23)),
        vol.Required(ATTR_MINUTE): vol.All(vol.Coerce(int), vol.Range(min=0, max=59)),
        vol.Required(ATTR_SECOND): vol.All(vol.Coerce(int), vol.Range(min=0, max=59)),
    }
)

FRONTEND_URL = "/noopsyche_k7/noopsyche-k7-card.js"


@dataclass
class NooPsycheK7RuntimeData:
    """Runtime objects stored on the config entry."""

    client: NooPsycheK7Client
    coordinator: NooPsycheK7Coordinator


def _loaded_runtime_data(
    hass: HomeAssistant, config_entry_id: str
) -> NooPsycheK7RuntimeData:
    entry = hass.config_entries.async_get_entry(config_entry_id)
    if entry is None:
        raise ServiceValidationError("No Noo-Psyche K7 config entry was found")
    if entry.state is not ConfigEntryState.LOADED:
        raise ServiceValidationError("The Noo-Psyche K7 config entry is not loaded")
    runtime_data: NooPsycheK7RuntimeData = entry.runtime_data
    return runtime_data


def _parse_schedule(value: list[Any]) -> tuple[ScheduleSlot, ...]:
    if len(value) != 24:
        raise ServiceValidationError("A K7 schedule must contain exactly 24 slots")

    slots: list[ScheduleSlot] = []
    try:
        for item in value:
            if not isinstance(item, dict):
                raise ValueError("Each schedule slot must be an object")
            channels = item["channels"]
            slots.append(
                ScheduleSlot(
                    hour=int(item["hour"]),
                    minute=int(item.get("minute", 0)),
                    channels=tuple(int(channel) for channel in channels),
                )
            )
    except (KeyError, TypeError, ValueError) as err:
        raise ServiceValidationError(f"Invalid K7 schedule: {err}") from err
    return tuple(slots)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register integration actions."""

    frontend_path = Path(__file__).parent / "frontend" / "noopsyche-k7-card.js"
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=FRONTEND_URL,
                path=str(frontend_path),
                cache_headers=True,
            )
        ]
    )

    async def async_get_schedule(call: ServiceCall) -> ServiceResponse:
        runtime_data = _loaded_runtime_data(hass, call.data[ATTR_CONFIG_ENTRY_ID])
        response = runtime_data.coordinator.data.as_dict()
        response[CONF_HOST] = runtime_data.client.host
        response[CONF_PORT] = runtime_data.client.port
        return response

    async def async_set_schedule(call: ServiceCall) -> None:
        runtime_data = _loaded_runtime_data(hass, call.data[ATTR_CONFIG_ENTRY_ID])
        schedule = _parse_schedule(call.data[ATTR_SCHEDULE])
        auto_mode = call.data.get(
            ATTR_AUTO_MODE, runtime_data.coordinator.data.auto_mode
        )
        try:
            await runtime_data.coordinator.async_set_schedule(
                schedule,
                auto_mode,
                tuple(call.data[ATTR_MANUAL]) if ATTR_MANUAL in call.data else None,
            )
        except K7Error as err:
            raise HomeAssistantError(f"Unable to write K7 schedule: {err}") from err

    async def async_apply_profile(call: ServiceCall) -> None:
        runtime_data = _loaded_runtime_data(hass, call.data[ATTR_CONFIG_ENTRY_ID])
        schedule = get_factory_profile(call.data[ATTR_PROFILE])
        try:
            await runtime_data.coordinator.async_set_schedule(
                schedule,
                call.data[ATTR_AUTO_MODE],
                (50, 50, 50, 50, 50, 50),
            )
        except K7Error as err:
            raise HomeAssistantError(f"Unable to apply K7 profile: {err}") from err

    async def async_get_profile(call: ServiceCall) -> ServiceResponse:
        schedule = get_factory_profile(call.data[ATTR_PROFILE])
        return {
            ATTR_PROFILE: call.data[ATTR_PROFILE],
            ATTR_MANUAL: [50, 50, 50, 50, 50, 50],
            ATTR_SCHEDULE: [slot.as_dict() for slot in schedule],
        }

    async def async_preview(call: ServiceCall) -> None:
        runtime_data = _loaded_runtime_data(hass, call.data[ATTR_CONFIG_ENTRY_ID])
        try:
            await runtime_data.client.async_preview(call.data[ATTR_CHANNELS])
        except K7Error as err:
            raise HomeAssistantError(f"Unable to preview K7 output: {err}") from err

    async def async_sync_time(call: ServiceCall) -> None:
        runtime_data = _loaded_runtime_data(hass, call.data[ATTR_CONFIG_ENTRY_ID])
        target = dt_util.now().replace(
            hour=call.data[ATTR_HOUR],
            minute=call.data[ATTR_MINUTE],
            second=call.data[ATTR_SECOND],
            microsecond=0,
        )
        try:
            await runtime_data.client.async_sync_time(target)
        except K7Error as err:
            raise HomeAssistantError(f"Unable to synchronize K7 time: {err}") from err

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_SCHEDULE,
        async_get_schedule,
        schema=ENTRY_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_SCHEDULE,
        async_set_schedule,
        schema=SET_SCHEDULE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY_PROFILE,
        async_apply_profile,
        schema=APPLY_PROFILE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_PROFILE,
        async_get_profile,
        schema=GET_PROFILE_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_PREVIEW,
        async_preview,
        schema=PREVIEW_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SYNC_TIME,
        async_sync_time,
        schema=SYNC_TIME_SCHEMA,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one Noo-Psyche K7 light."""
    client = NooPsycheK7Client(entry.data[CONF_HOST], entry.data[CONF_PORT])
    coordinator = NooPsycheK7Coordinator(hass, entry, client)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = NooPsycheK7RuntimeData(client, coordinator)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
