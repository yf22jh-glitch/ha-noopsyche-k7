"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

let CardClass;

global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = { querySelector: () => null, querySelectorAll: () => [] };
    return this.shadowRoot;
  }
};
global.customElements = {
  get: () => undefined,
  define: (_name, candidate) => {
    CardClass = candidate;
  },
};
global.window = {
  confirm: () => true,
  customCards: [],
};

const originalConsoleInfo = console.info;
console.info = () => {};
require(process.env.K7_CARD_PATH || "../custom_components/noopsyche_k7/frontend/noopsyche-k7-card.js");
console.info = originalConsoleInfo;

const createCard = () => {
  const calls = [];
  const card = new CardClass();
  card._configEntryId = "test-entry";
  card._live = { auto_mode: true };
  card._draft = {
    auto_mode: true,
    manual: [10, 20, 30, 40, 50, 60],
    schedule: [{ hour: 0, minute: 0, channels: [1, 2, 3, 4, 5, 6] }],
  };
  card._hass = {
    callService: async (domain, service, data) => {
      calls.push({ domain, service, data });
    },
  };
  card._render = () => {};
  card._toast = () => {};
  card._loadSchedule = async () => {};
  return { card, calls };
};

test("schedule can be the initial tab without sending a device command", () => {
  const { card, calls } = createCard();
  card.setConfig({ entity: "select.test_operating_mode", default_tab: "schedule" });

  assert.equal(card._tab, "schedule");
  assert.equal(card.getCardSize(), 10);
  assert.deepEqual(calls, []);
});

test("the default tab does not replace the user's tab on the same configuration", () => {
  const { card, calls } = createCard();
  const config = { entity: "select.test_operating_mode", default_tab: "schedule" };
  card.setConfig(config);
  card._tab = "control";
  card.setConfig({ ...config });

  assert.equal(card._tab, "control");
  assert.deepEqual(calls, []);
});

test("unconfigured cards retain the original control tab", () => {
  const { card } = createCard();
  card.setConfig({ entity: "select.test_operating_mode" });

  assert.equal(card._tab, "control");
});

test("changing the configured default or entity applies the new initial tab", () => {
  const { card } = createCard();
  card.setConfig({ entity: "select.test_operating_mode", default_tab: "schedule" });
  card.setConfig({ entity: "select.test_operating_mode", default_tab: "transfer" });
  assert.equal(card._tab, "transfer");

  card._tab = "control";
  card.setConfig({ entity: "select.another_operating_mode", default_tab: "schedule" });
  assert.equal(card._tab, "schedule");
});

test("invalid default tabs are rejected before changing card state", () => {
  const { card } = createCard();
  card.setConfig({ entity: "select.test_operating_mode", default_tab: "schedule" });

  assert.throws(() => card.setConfig({ entity: "select.test_operating_mode", default_tab: "unknown" }), /default_tab/);
  assert.equal(card._tab, "schedule");
  assert.equal(card._config.default_tab, "schedule");
});

const createScheduleCard = () => {
  const result = createCard();
  result.card._hass.config = { time_zone: "Asia/Seoul" };
  result.card._hass.language = "ko";
  result.card._hass.states = {};
  result.card._draft.schedule = Array.from({ length: 24 }, (_, hour) => ({
    hour, minute: 0, channels: [hour, hour * 2, 0, hour * 3, hour * 4, 1],
  }));
  result.card._live = JSON.parse(JSON.stringify(result.card._draft));
  return result;
};

test("current-time display uses the HA time zone, including midnight", () => {
  const { card } = createScheduleCard();
  assert.deepEqual(card._currentScheduleTime(new Date("2026-10-02T04:27:00Z")), { hour: 13, minute: 27 });
  assert.deepEqual(card._currentScheduleTime(new Date("2026-10-02T15:00:00Z")), { hour: 0, minute: 0 });
  card._hass.config.time_zone = "America/New_York";
  assert.deepEqual(card._currentScheduleTime(new Date("2026-10-02T04:27:00Z")), { hour: 0, minute: 27 });
  delete card._hass.config;
  const local = new Date("2026-10-02T04:27:00Z");
  assert.deepEqual(card._currentScheduleTime(local), { hour: local.getHours(), minute: local.getMinutes() });
});

test("current-time channel markers sample the drawn quadratic curve", () => {
  const { card } = createScheduleCard();
  card._draft.schedule = [
    { hour: 0, minute: 0, channels: [0, 0, 0, 0, 0, 0] },
    { hour: 1, minute: 0, channels: [60, 30, 0, 60, 60, 10] },
    { hour: 2, minute: 0, channels: [0, 0, 0, 0, 0, 0] },
  ];
  const t = 2 - Math.sqrt(2); // x(t)=120t-30t² reaches the first hour.
  const expected = 120 * t - 90 * t ** 2;
  assert.ok(Math.abs(card._curveChannelsAt(60)[0] - expected) < 1e-8);
  assert.ok(Math.abs(card._curveChannelsAt(90)[0] - 30) < 1e-8);
  assert.deepEqual(card._curveChannelsAt(0), [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(card._curveChannelsAt(1439), [0, 0, 0, 0, 0, 0]);
  assert.notEqual(Math.round(card._curveChannelsAt(60)[0]), 60);
});

test("initial schedule read selects the current hour but never changes stored points or output", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-02T04:27:00Z") });
  const { card, calls } = createScheduleCard();
  const stored = JSON.parse(JSON.stringify(card._draft));
  const readCalls = [];
  card._hass.callWS = async (message) => {
    readCalls.push(message);
    return { response: stored };
  };
  card._loadSchedule = CardClass.prototype._loadSchedule;
  await card._loadSchedule(false);

  assert.equal(card._selectedSlot, 13);
  assert.equal(card._followCurrentTime, true);
  assert.equal(card._scheduleDisplayPoint().hour, 13);
  assert.equal(card._scheduleDisplayPoint().minute, 27);
  assert.equal(card._draft.schedule[13].minute, 0);
  assert.deepEqual(card._draft.schedule, stored.schedule);
  assert.equal(card._isDirty(), false);
  assert.deepEqual(readCalls.map(({ type, domain, service }) => ({ type, domain, service })), [
    { type: "call_service", domain: "noopsyche_k7", service: "get_schedule" },
  ]);
  assert.deepEqual(calls, []);
  const view = card._scheduleView();
  assert.match(view, /data-chart-time>13:27/);
  assert.match(view, /현재 시각의 일정 곡선 기준 · 실측 출력 아님/);
  assert.match(view, /data-chart-channel="5">1%/);
});

const bindButtons = (card, selector, dataset) => {
  const handlers = {};
  const button = { dataset, addEventListener: (kind, handler) => { handlers[kind] = handler; } };
  card.shadowRoot.querySelectorAll = (query) => query === selector ? [button] : [];
  card._bind();
  return handlers;
};

test("entering the schedule tab selects now, while unsaved edits retain their selected point", (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-02T04:27:00Z") });
  const { card, calls } = createScheduleCard();
  card._tab = "control";
  card._selectedSlot = 2;
  card._followCurrentTime = false;
  bindButtons(card, "[data-tab]", { tab: "schedule" }).click();
  assert.equal(card._selectedSlot, 13);
  assert.equal(card._followCurrentTime, true);

  card._tab = "control";
  card._selectedSlot = 2;
  card._followCurrentTime = false;
  card._draft.schedule[2].channels[0] = 77;
  bindButtons(card, "[data-tab]", { tab: "schedule" }).click();
  assert.equal(card._selectedSlot, 2);
  assert.equal(card._followCurrentTime, false);
  assert.equal(card._draft.schedule[2].channels[0], 77);
  assert.deepEqual(calls, []);
});

test("manual point selection survives HA state updates and current-time return sends nothing", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-02T04:27:00Z") });
  const { card, calls } = createScheduleCard();
  bindButtons(card, "[data-slot]", { slot: "8" }).click();
  card._resolved = true;
  card.hass = card._hass;
  assert.equal(card._selectedSlot, 8);
  assert.equal(card._followCurrentTime, false);
  assert.equal(card._scheduleDisplayPoint().hour, 8);
  await card._handleAction("current-time");
  assert.equal(card._followCurrentTime, true);
  assert.equal(card._selectedSlot, 13);
  assert.deepEqual(calls, []);
});

test("the clock updates chart labels and markers without replacing draft inputs", (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-02T04:27:00Z") });
  const { card, calls } = createScheduleCard();
  card._showCurrentTime();
  const before = JSON.stringify(card._draft);
  const node = (dataset = {}) => ({ dataset, attrs: {}, classList: { toggle() {} }, setAttribute(name, value) { this.attrs[name] = String(value); } });
  const time = node();
  const line = node();
  const circles = Array.from({ length: 6 }, () => node());
  const labels = Array.from({ length: 6 }, (_, index) => node({ chartChannel: String(index) }));
  card.shadowRoot = {
    querySelector: (selector) => ({ "[data-chart-time]": time, ".selected-line": line })[selector] || null,
    querySelectorAll: (selector) => ({ ".selected-markers circle": circles, "[data-chart-channel]": labels })[selector] || [],
    set innerHTML(_value) { assert.fail("A clock tick must not replace the editor DOM"); },
  };
  card._updateClock();
  assert.equal(time.textContent, "13:27");
  assert.equal(labels[5].textContent, "1%");
  const markerBefore = line.attrs.x1;
  t.mock.timers.tick(60_000);
  card._updateClock();
  assert.equal(time.textContent, "13:28");
  assert.notEqual(line.attrs.x1, markerBefore);
  assert.equal(JSON.stringify(card._draft), before);
  assert.equal(card._selectedSlot, 13);
  assert.deepEqual(calls, []);
});

test("mode changes update both card snapshots", async () => {
  const { card, calls } = createCard();

  await card._setMode("manual");

  assert.equal(card._live.auto_mode, false);
  assert.equal(card._draft.auto_mode, false);
  assert.deepEqual(calls, [
    {
      domain: "select",
      service: "select_option",
      data: { entity_id: undefined, option: "manual" },
    },
  ]);
});

test("schedule save preserves the coordinator's current operating mode", async () => {
  const { card, calls } = createCard();
  card._isDirty = () => true;

  await card._saveSchedule();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].domain, "noopsyche_k7");
  assert.equal(calls[0].service, "set_schedule");
  assert.equal(Object.hasOwn(calls[0].data, "auto_mode"), false);
  assert.equal(calls[0].data.config_entry_id, "test-entry");
  assert.deepEqual(calls[0].data.schedule, card._draft.schedule);
});
