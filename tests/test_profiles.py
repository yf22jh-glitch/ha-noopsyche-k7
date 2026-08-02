"""Tests for factory profiles."""

from custom_components.noopsyche_k7.const import (
    PROFILE_LPS,
    PROFILE_MIXED,
    PROFILE_SPS,
)
from custom_components.noopsyche_k7.profiles import get_factory_profile


def test_factory_profiles_have_24_slots() -> None:
    for name in (PROFILE_SPS, PROFILE_LPS, PROFILE_MIXED):
        profile = get_factory_profile(name)
        assert len(profile) == 24
        assert [slot.hour for slot in profile] == list(range(24))


def test_official_lps_peak() -> None:
    profile = get_factory_profile(PROFILE_LPS)
    assert profile[11].channels == (5, 80, 50, 10, 80, 0)
    assert profile[20].channels == (0, 10, 0, 3, 10, 0)
