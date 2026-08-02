"""Factory schedules recovered from the official Noo-Psyche application."""

from __future__ import annotations

from .api import ScheduleSlot
from .const import PROFILE_LPS, PROFILE_MIXED, PROFILE_SPS

ZERO = (0, 0, 0, 0, 0, 0)


def _schedule(
    low: tuple[int, int, int, int, int, int],
    medium: tuple[int, int, int, int, int, int],
    high: tuple[int, int, int, int, int, int],
) -> tuple[ScheduleSlot, ...]:
    values = [ZERO] * 24
    values[9] = low
    values[10] = medium
    for hour in range(11, 19):
        values[hour] = high
    values[19] = medium
    values[20] = low
    return tuple(
        ScheduleSlot(hour=hour, minute=0, channels=channels)
        for hour, channels in enumerate(values)
    )


FACTORY_PROFILES: dict[str, tuple[ScheduleSlot, ...]] = {
    PROFILE_SPS: _schedule(
        (30, 30, 30, 30, 30, 30),
        (50, 50, 50, 50, 50, 50),
        (95, 95, 95, 95, 95, 95),
    ),
    PROFILE_LPS: _schedule(
        (0, 10, 0, 3, 10, 0),
        (1, 30, 20, 5, 30, 0),
        (5, 80, 50, 10, 80, 0),
    ),
    PROFILE_MIXED: _schedule(
        (5, 20, 20, 20, 20, 0),
        (10, 40, 40, 40, 40, 5),
        (30, 90, 90, 70, 90, 20),
    ),
}


def get_factory_profile(name: str) -> tuple[ScheduleSlot, ...]:
    """Return a factory profile by stable profile key."""
    try:
        return FACTORY_PROFILES[name]
    except KeyError as err:
        raise ValueError(f"Unknown factory profile: {name}") from err
