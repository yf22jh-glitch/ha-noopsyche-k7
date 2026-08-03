# App-style Home Assistant dashboard

The bundled `noopsyche-k7-card` turns the official Android application's
control workflow into one responsive Lovelace card. It uses Home Assistant
entities and integration actions; it does not copy Android source or assets.

## Add the card

The integration serves the JavaScript module from Home Assistant. Add this
**JavaScript Module** under **Settings → Dashboards → Resources**:

```text
/noopsyche_k7/noopsyche-k7-card.js?v=0.2.1
```

Then add a Manual card and select the K7 operating-mode entity:

```yaml
type: custom:noopsyche-k7-card
entity: select.k7_pro10021_operating_mode
```

Using the Lovelace resource as the single loading path ensures the card is
registered after the Home Assistant frontend is ready. It prevents the
intermittent `Custom element doesn't exist: noopsyche-k7-card` error caused by
an early startup import.

The card looks up all other `noopsyche_k7` entities belonging to the same
config entry. Renaming the entities does not break this lookup.

## Feature mapping

| Official app workflow | Home Assistant card |
| --- | --- |
| K7 Pro / K7 Mini device selection | Config-entry device header and model |
| AP/LAN setup and device IP | Home Assistant Config Flow and device information |
| Automatic/manual switch | Two-state operating-mode control |
| Six manual channel sliders | Master brightness and six channel sliders |
| 24-hour line chart | Responsive six-series SVG curve |
| Time-point list | 24 point buttons and one focused point editor |
| Minute and six-channel editing | Draft minute field and six draft sliders |
| SPS, LPS, and S/L factory settings | Draft-only profile buttons |
| Clear/reset | Draft-only Set all to zero action |
| Preview one time point | Preview selected values action |
| Save all settings | Confirmed Save schedule action |
| Demo mode | Optimistic Demonstration switch |
| System/custom clock synchronization | Current-time and explicit-time actions |
| QR export/import | Portable JSON copy, download, file import, and paste |
| Connection list | HA availability and fixed host/port display |

JSON replaces QR because it is directly inspectable, versionable, and easy to
back up in Home Assistant. Importing JSON never writes to the lamp by itself.

## Safety model

The following controls only edit the card's in-browser draft:

- SPS, LPS, and S/L profile buttons
- Set all to zero
- JSON file import or paste
- selecting and editing schedule points

The following controls communicate with the lamp when selected:

- mode, master brightness, and channel controls
- current-time or explicit-time synchronization
- demonstration mode
- selected-point preview
- confirmed schedule save

Schedule save always shows a confirmation prompt and sends exactly 24 validated
points. Reload stored values discards the browser draft and reads the current
coordinator state again.
