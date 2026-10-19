"""Exercise command serialization with a real HA coordinator and fake lamp I/O.

The protocol-only environment skips this module. CI's HA runtime job requires
Home Assistant explicitly and runs these tests on Python 3.14.
"""

# ruff: noqa: E402
import asyncio
import tempfile
import unittest
from dataclasses import replace

import pytest

pytest.importorskip("homeassistant")
from homeassistant.core import HomeAssistant

from custom_components.noopsyche_k7.api import K7Error, LampState
from custom_components.noopsyche_k7.coordinator import NooPsycheK7Coordinator
from custom_components.noopsyche_k7.light import NooPsycheK7Light
from custom_components.noopsyche_k7.number import CHANNELS, NooPsycheK7Channel


class LampClient:
    def __init__(self):
        self.state = LampState((10, 20, 30, 40, 50, 60), (), False, "TEST")
        self.writes = []
        self.started = asyncio.Event()
        self.release = asyncio.Event()
        self.release.set()
        self.fail_reads = False

    async def async_get_state(self):
        await asyncio.sleep(0)
        if self.fail_reads:
            raise K7Error("read unavailable")
        return self.state

    async def async_set_manual(self, values):
        self.started.set()
        await self.release.wait()
        self.writes.append(("manual", tuple(values)))
        self.state = replace(self.state, manual=tuple(values))

    async def async_set_mode(self, auto):
        self.writes.append(("mode", auto))
        self.state = replace(self.state, auto_mode=auto)

    async def async_set_schedule(self, manual, schedule, auto):
        self.writes.append(("schedule", tuple(manual), schedule, auto))
        self.state = replace(
            self.state, manual=tuple(manual), schedule=schedule, auto_mode=auto
        )


class K7Tests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="k7-isolated-")
        self.hass = HomeAssistant(self.directory.name)
        self.client = LampClient()
        self.coordinator = NooPsycheK7Coordinator(self.hass, None, self.client)
        self.coordinator.async_set_updated_data(self.client.state)
        self.lamp = object.__new__(NooPsycheK7Light)
        self.lamp.coordinator = self.coordinator
        self.lamp._last_nonzero = None

    async def asyncTearDown(self):
        await self.coordinator.async_shutdown()
        await self.hass.async_stop(force=True)
        self.directory.cleanup()

    def channel(self, index):
        entity = object.__new__(NooPsycheK7Channel)
        entity.coordinator = self.coordinator
        entity.entity_description = CHANNELS[index]
        return entity

    async def test_brightness_then_channel_keeps_other_channels(self):
        self.client.release.clear()
        first = asyncio.create_task(self.lamp.async_turn_on(brightness=255))
        await self.client.started.wait()
        second = asyncio.create_task(self.channel(0).async_set_native_value(25))
        await asyncio.sleep(0)
        self.client.release.set()
        await asyncio.wait_for(asyncio.gather(first, second), 2)
        self.assertEqual(self.client.state.manual, (25, 33, 50, 67, 83, 100))
        self.assertEqual(self.coordinator.data, self.client.state)

    async def test_six_simultaneous_channels_preserve_each_other(self):
        await asyncio.gather(
            *(self.channel(i).async_set_native_value(i + 1) for i in range(6))
        )
        self.assertEqual(self.client.state.manual, (1, 2, 3, 4, 5, 6))

    async def test_external_device_change_is_read_before_partial_update(self):
        self.client.state = replace(self.client.state, manual=(80, 70, 60, 50, 40, 30))
        await self.channel(1).async_set_native_value(5)
        self.assertEqual(self.client.state.manual, (80, 5, 60, 50, 40, 30))

    async def test_off_on_restores_the_fresh_previous_channels(self):
        self.client.state = replace(self.client.state, manual=(5, 10, 15, 20, 25, 30))
        await self.lamp.async_turn_off()
        await self.lamp.async_turn_on()
        self.assertEqual(self.client.state.manual, (5, 10, 15, 20, 25, 30))

    async def test_schedule_preserves_new_mode_and_channels(self):
        await self.coordinator.async_set_mode(True)
        self.client.state = replace(self.client.state, manual=(2, 3, 4, 5, 6, 7))
        await self.coordinator.async_set_schedule((), None)
        self.assertEqual(
            self.client.writes[-1], ("schedule", (2, 3, 4, 5, 6, 7), (), True)
        )

    async def test_explicit_zero_manual_schedule_is_preserved(self):
        await self.coordinator.async_set_schedule((), False, (0,) * 6)
        self.assertEqual(self.client.state.manual, (0,) * 6)

    async def test_mode_change_rejects_queued_manual_without_marking_device_offline(
        self,
    ):
        await self.coordinator.async_set_mode(True)
        with self.assertRaises(K7Error):
            await self.coordinator.async_set_manual((30,) * 6)
        self.assertTrue(self.coordinator.last_update_success)
        self.assertEqual(self.client.writes, [("mode", True)])

    async def test_read_failure_sends_no_write_and_recovers(self):
        self.client.fail_reads = True
        with self.assertRaises(K7Error):
            await self.coordinator.async_set_manual((20,) * 6)
        self.assertEqual(self.client.writes, [])
        self.assertFalse(self.coordinator.last_update_success)
        self.client.fail_reads = False
        await self.channel(0).async_set_native_value(40)
        self.assertTrue(self.coordinator.last_update_success)

    async def test_confirmation_failure_never_publishes_unobserved_values(self):
        before = self.coordinator.data
        original = self.client.async_set_manual

        async def write_then_lose_read(values):
            await original(values)
            self.client.fail_reads = True

        self.client.async_set_manual = write_then_lose_read
        with self.assertRaises(K7Error):
            await self.coordinator.async_set_manual((20,) * 6)
        self.assertEqual(self.coordinator.data, before)
        self.assertEqual(len(self.client.writes), 1)
        self.client.async_set_manual = original
        self.client.fail_reads = False
        await self.channel(0).async_set_native_value(30)
        self.assertEqual(self.client.state.manual, (30, 20, 20, 20, 20, 20))

    async def test_poll_during_write_cannot_republish_an_old_snapshot(self):
        self.client.release.clear()
        command = asyncio.create_task(self.coordinator.async_set_manual((42,) * 6))
        await self.client.started.wait()
        poll = asyncio.create_task(self.coordinator.async_refresh())
        await asyncio.sleep(0)
        self.client.release.set()
        await asyncio.wait_for(asyncio.gather(command, poll), 2)
        self.assertEqual(self.coordinator.data.manual, (42,) * 6)

    async def test_cancelled_write_releases_transaction(self):
        self.client.release.clear()
        task = asyncio.create_task(self.coordinator.async_set_manual((11,) * 6))
        await self.client.started.wait()
        task.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await task
        self.client.release.set()
        await asyncio.wait_for(self.channel(2).async_set_native_value(55), 1)
        self.assertEqual(self.client.state.manual, (10, 20, 55, 40, 50, 60))
