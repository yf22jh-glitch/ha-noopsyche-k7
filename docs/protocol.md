# Noo-Psyche K7 local protocol

This document records interoperability facts recovered from the official
Noo-Psyche Android application. Decompiled application source and the APK are
not distributed in this repository.

## Analysed application

- Official source page: <https://www.noo-psyche.com/Userguidance>
- Official download endpoint: <https://www.noo-psyche.com/filedownload/616871>
- File: `noo-psyche_release_203.apk`
- Package: `com.nemo.caideng`
- Version: `2.0.3` (`versionCode` 23)
- SHA-256: `84addedf78c3f402397bdcc323626a12a5f18bc6a29435a5839ac31c1b23ad61`
- Signing-certificate SHA-256: `A7:DE:F9:B7:6B:0B:2D:69:23:04:54:92:11:D7:D9:9B:25:17:1E:DA:C1:3B:59:4B:5B:C8:A7:54:FC:71:6C:D5`
- Static-analysis date: 2026-08-02

The official website still lists 2.0.3 as its Android release as of the
analysis date.

## Transport and framing

- TCP port: `8266`
- Authentication: none
- Command frame: `AA A5 <command:2> <payload> BB`
- Full-state response begins: `AB AA 10 08`
- The application also recognizes the short acknowledgement `AB AA A5 A1`.

Because the protocol has no authentication or encryption, the light should be
kept on a trusted LAN/VLAN and TCP 8266 should not be exposed to the internet.

## Commands

| Command | Payload | Meaning |
| --- | --- | --- |
| `10 03` | hour, minute, second | Synchronize clock |
| `10 04` | `00` manual / `01` automatic | Change mode |
| `10 05` | six percentages | Manual channel output |
| `10 06` | six percentages | Preview channel output |
| `10 07` | complete configuration | Write all settings |
| `10 08` | none | Read all settings |
| `10 0A` | `00` enabled / `01` disabled | Demonstration |

The app declares `10 09` as `PASS_SET`, but the analysed version contains no
method that sends it.

## Channel order

The app's slider and graph colors establish this byte order for K7 Pro:

1. White
2. Royal blue
3. Green
4. UV/violet
5. Blue/cyan
6. Red

K7 Mini uses the first three channel positions and sends zero for the remaining
positions.

## Complete configuration

The `10 07` payload is 203 bytes:

```text
manual[6]
slot_count = 0x18
24 * (hour, minute, channels[6])
automatic_mode[1]
hour, minute, second
```

The response parser uses the confirmed prefix below. The official app reads the
mode at absolute response byte 203 when 24 slots are present and expects more
than 214 bytes in the complete response. Some firmware variants append clock
or device-identifier data before `BB`; the client preserves that trailing data
and extracts identifiers matching `K7_Pro...` or `K7mini...`.

```text
AB AA 10 08
manual[6]
slot_count[1]
slot_count * (hour, minute, channels[6])
automatic_mode[1]
optional firmware-specific trailing data
BB
```

## Independent comparison

The recovered values were compared with the MIT-licensed
[`bitbarista/k7-led-controller`](https://github.com/bitbarista/k7-led-controller)
implementation. Its independently developed TCP implementation agrees on the
framing, command identifiers, channel count, schedule layout, and port. No code
from the official APK is copied into this repository.

## Validation status

Static analysis and automated mock-device tests are complete. A read-only probe
to the known light address `10.0.30.135:8266` timed out on 2026-08-02, so a raw
hardware response and all write operations remain to be validated with the
physical light online.
