"""Constants for the Noo-Psyche K7 integration."""

from datetime import timedelta

DOMAIN = "noopsyche_k7"

DEFAULT_PORT = 8266
DEFAULT_TIMEOUT = 6.0
DEFAULT_UPDATE_INTERVAL = timedelta(seconds=30)

ATTR_CONFIG_ENTRY_ID = "config_entry_id"
ATTR_SCHEDULE = "schedule"
ATTR_PROFILE = "profile"
ATTR_AUTO_MODE = "auto_mode"

SERVICE_GET_SCHEDULE = "get_schedule"
SERVICE_SET_SCHEDULE = "set_schedule"
SERVICE_APPLY_PROFILE = "apply_profile"

MODE_AUTO = "auto"
MODE_MANUAL = "manual"

PROFILE_SPS = "sps"
PROFILE_LPS = "lps"
PROFILE_MIXED = "mixed"
PROFILES = (PROFILE_SPS, PROFILE_LPS, PROFILE_MIXED)

CHANNEL_KEYS = (
    "white",
    "royal_blue",
    "green",
    "uv",
    "blue",
    "red",
)
