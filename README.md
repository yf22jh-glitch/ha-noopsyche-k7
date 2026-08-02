# Noo-Psyche K7 for Home Assistant

Local, cloud-free Home Assistant control for Noo-Psyche K7 aquarium lights.
The integration talks directly to the light over TCP port 8266.

> [!CAUTION]
> This is an early reverse-engineered integration. Protocol structure is
> verified against the official Android APK, automated tests, and a physical K7
> Pro read-state response. Physical validation of write commands is still in
> progress. Back up the existing schedule with `noopsyche_k7.get_schedule`
> before any schedule write.

## Features

- UI setup by fixed IP address
- Automatic/manual operating-mode selector
- Manual-output `light` entity with master brightness
- Six manual channel sliders: White, Royal blue, Green, UV, Blue, Red
- Clock synchronization button
- Read and write actions for the complete 24-point schedule
- Official-app SPS, LPS, and mixed factory profiles
- Local polling and automatic unavailable/recovery handling
- Korean and English translations

Manual controls are intentionally unavailable while the light is in automatic
mode. Select **Manual** first; this prevents a channel adjustment from silently
disabling the stored automatic schedule.

## Installation

### Manual

Copy `custom_components/noopsyche_k7` into the same path below your Home
Assistant configuration directory, then restart Home Assistant:

```text
<config>/custom_components/noopsyche_k7
```

Go to **Settings → Devices & services → Add integration**, search for
**Noo-Psyche K7**, and enter the light's fixed IP address. The default port is
8266. A DHCP reservation is recommended.

### HACS custom repository

1. Open HACS and select the three-dot menu in the top-right corner.
2. Select **Custom repositories**.
3. Add `https://github.com/yf22jh-glitch/ha-noopsyche-k7` as an
   **Integration** repository.
4. Download **Noo-Psyche K7** and restart Home Assistant.
5. Go to **Settings → Devices & services → Add integration**, search for
   **Noo-Psyche K7**, and enter the light's fixed IP address.

HACS tracks published releases and exposes future versions through Home
Assistant's update entities.

## Actions

### Get schedule

`noopsyche_k7.get_schedule` is a response-only action. Select the configuration
entry; the response contains `manual`, `auto_mode`, channel order, and all
schedule slots.

### Set schedule

`noopsyche_k7.set_schedule` requires exactly 24 objects:

```yaml
action: noopsyche_k7.set_schedule
data:
  config_entry_id: 01EXAMPLE
  auto_mode: true
  schedule:
    - hour: 0
      minute: 0
      channels: [0, 0, 0, 0, 0, 0]
    # ...exactly 23 more slots...
```

This overwrites the light's stored schedule.

### Apply factory profile

`noopsyche_k7.apply_profile` accepts `sps`, `lps`, or `mixed`. These schedules
match the defaults embedded in the official Android app. Applying a profile
also overwrites the stored schedule.

## Compatibility and safety

- K7 Pro protocol: read-state path physically verified with app 2.0.3 protocol
- K7 Pro write commands: physical validation pending
- K7 Mini: protocol-compatible by app design; physical validation pending
- No cloud account or token is used
- The lamp protocol has no authentication, so never expose TCP 8266 publicly
- Broadcast discovery is not required; VLAN users should register the IP

See [the protocol notes](docs/protocol.md) for APK hashes, commands, and current
validation status.

## Development

```bash
python3.11 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/ruff check .
.venv/bin/pytest
```

The official APK and decompiled output are excluded from Git and are not needed
to run the integration.
