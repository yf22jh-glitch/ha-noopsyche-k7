const CARD_VERSION = "0.3.1";

const CHANNELS = [
  { key: "white", name: "White", ko: "화이트", color: "#c8d4dc" },
  { key: "royal_blue", name: "Royal Blue", ko: "로열 블루", color: "#246bdb" },
  { key: "green", name: "Green", ko: "그린", color: "#2ca56c" },
  { key: "uv", name: "UV", ko: "UV", color: "#8d5bd6" },
  { key: "blue", name: "Blue", ko: "블루", color: "#00a9e8" },
  { key: "red", name: "Red", ko: "레드", color: "#e45c4c" },
];

const CHART = {
  width: 820,
  height: 300,
  left: 54,
  right: 22,
  top: 30,
  bottom: 42,
  hours: 24,
};

const TEXT = {
  ko: {
    control: "제어",
    schedule: "일정",
    transfer: "가져오기·내보내기",
    connected: "연결됨",
    unavailable: "연결 끊김",
    automatic: "자동",
    manual: "수동",
    mode: "작동 모드",
    systemTime: "Home Assistant 시간",
    syncNow: "현재 시간 동기화",
    setTime: "시간 직접 설정",
    demonstration: "데모 모드",
    demonstrationHint: "빠르게 하루 광량 변화를 재생합니다.",
    master: "전체 밝기",
    manualHint: "수동 모드에서만 전체 밝기와 채널을 조절할 수 있어요.",
    loading: "K7 정보를 불러오는 중…",
    retry: "다시 불러오기",
    chart: "24시간 광량 곡선",
    live: "조명에 저장됨",
    draft: "편집 중",
    clean: "변경 없음",
    profiles: "공식 앱 프로필",
    mixed: "S/L 혼합",
    selectedPoint: "선택 시간점",
    minute: "분",
    preview: "선택 값 미리보기",
    previewWarning: "미리보기는 조명 출력에 즉시 반영됩니다.",
    zero: "전체 0으로",
    reload: "저장값 다시 읽기",
    save: "일정 저장",
    saveConfirm: "현재 편집한 24개 시간점으로 조명 일정을 덮어쓸까요?",
    exportTitle: "일정 내보내기",
    exportHint: "공식 앱 QR 공유와 같은 용도로 JSON 백업을 복사하거나 파일로 저장해요.",
    copy: "JSON 복사",
    download: "파일 다운로드",
    importTitle: "일정 가져오기",
    importHint: "이 카드에서 내보낸 JSON 파일이나 텍스트를 불러와 편집 초안으로 확인해요. 불러오기만으로는 조명에 저장되지 않습니다.",
    importFile: "JSON 파일 선택",
    paste: "JSON 붙여넣기",
    device: "장치 정보",
    host: "주소",
    entry: "구성 항목",
    entity: "기준 엔티티",
    refresh: "상태 새로고침",
    saved: "일정을 저장했어요.",
    copied: "JSON을 클립보드에 복사했어요.",
    imported: "일정을 편집 초안으로 불러왔어요.",
    previewed: "미리보기 값을 전송했어요.",
    profileLoaded: "프로필을 편집 초안으로 불러왔어요.",
    timeSynced: "조명 시간을 설정했어요.",
    invalidTime: "시간은 HH:MM:SS 형식으로 입력해 주세요.",
    invalidMinute: "분은 0부터 59까지 정수로 입력해 주세요.",
    invalidPercent: "퍼센트는 0부터 100까지 정수로 입력해 주세요.",
    directInput: "직접 입력",
    invalidImport: "올바른 K7 일정 JSON이 아니에요.",
    configError: "Noo-Psyche K7의 작동 모드 엔티티를 카드 설정에 지정해 주세요.",
    cardHint: "카드 설정 예: type: custom:noopsyche-k7-card / entity: select.…_operating_mode",
  },
  en: {
    control: "Control",
    schedule: "Schedule",
    transfer: "Import & export",
    connected: "Connected",
    unavailable: "Unavailable",
    automatic: "Automatic",
    manual: "Manual",
    mode: "Operating mode",
    systemTime: "Home Assistant time",
    syncNow: "Sync current time",
    setTime: "Set custom time",
    demonstration: "Demonstration",
    demonstrationHint: "Play an accelerated day-cycle preview.",
    master: "Master brightness",
    manualHint: "Master and channel controls are available in manual mode.",
    loading: "Loading K7 information…",
    retry: "Retry",
    chart: "24-hour intensity curve",
    live: "Stored on light",
    draft: "Editing draft",
    clean: "No changes",
    profiles: "Official app profiles",
    mixed: "S/L mixed",
    selectedPoint: "Selected point",
    minute: "Minute",
    preview: "Preview selected values",
    previewWarning: "Preview immediately changes the lamp output.",
    zero: "Set all to zero",
    reload: "Reload stored values",
    save: "Save schedule",
    saveConfirm: "Overwrite the light's schedule with these 24 edited points?",
    exportTitle: "Export schedule",
    exportHint: "Copy or download a JSON backup, serving the same purpose as the app's QR sharing.",
    copy: "Copy JSON",
    download: "Download file",
    importTitle: "Import schedule",
    importHint: "Load JSON as a draft for review. Importing alone does not write to the light.",
    importFile: "Choose JSON file",
    paste: "Paste JSON",
    device: "Device information",
    host: "Address",
    entry: "Config entry",
    entity: "Anchor entity",
    refresh: "Refresh state",
    saved: "Schedule saved.",
    copied: "JSON copied to the clipboard.",
    imported: "Schedule loaded as an editing draft.",
    previewed: "Preview values sent.",
    profileLoaded: "Profile loaded as an editing draft.",
    timeSynced: "Light time set.",
    invalidTime: "Enter time as HH:MM:SS.",
    invalidMinute: "Enter a whole-number minute from 0 to 59.",
    invalidPercent: "Enter a whole-number percentage from 0 to 100.",
    directInput: "Direct input",
    invalidImport: "This is not valid K7 schedule JSON.",
    configError: "Configure the card with the Noo-Psyche K7 operating-mode entity.",
    cardHint: "Example: type: custom:noopsyche-k7-card / entity: select.…_operating_mode",
  },
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, Number(value)));

const integerInRange = (value, minimum, maximum, label) => {
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new Error(`${label} must be a whole number`);
  }
  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}`);
  }
  return number;
};

const normalizeSchedule = (value) => {
  if (!Array.isArray(value) || value.length !== 24) {
    throw new Error("A K7 schedule must contain exactly 24 points");
  }
  return value.map((slot, index) => {
    if (!slot || !Array.isArray(slot.channels) || slot.channels.length !== 6) {
      throw new Error(`Invalid schedule point ${index}`);
    }
    return {
      hour: integerInRange(slot.hour ?? index, 0, 23, `Point ${index} hour`),
      minute: integerInRange(slot.minute ?? 0, 0, 59, `Point ${index} minute`),
      channels: slot.channels.map((channel, channelIndex) =>
        integerInRange(
          channel,
          0,
          100,
          `Point ${index} channel ${channelIndex}`,
        ),
      ),
    };
  });
};

class NooPsycheK7Card extends HTMLElement {
  static getStubConfig(_hass, entities = []) {
    const entity = entities.find(
      (candidate) =>
        candidate.startsWith("select.") && candidate.endsWith("_operating_mode"),
    );
    return entity ? { entity } : {};
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "control";
    this._selectedSlot = 0;
    this._entities = {};
    this._resolved = false;
    this._resolving = false;
    this._busy = false;
    this._error = null;
    this._live = null;
    this._draft = null;
    this._manualDraftChanged = false;
    this._lastStateSignature = null;
    this._clockTimer = null;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("Noo-Psyche K7 card requires an operating-mode entity");
    }
    this._config = { ...config };
    this._resolved = false;
    this._live = null;
    this._draft = null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._resolved && !this._resolving) {
      this._resolveEntities();
      return;
    }
    const signature = this._stateSignature();
    if (signature !== this._lastStateSignature) {
      this._lastStateSignature = signature;
      this._render();
    } else {
      this._updateClock();
    }
  }

  connectedCallback() {
    if (!this._clockTimer) {
      this._clockTimer = window.setInterval(() => this._updateClock(), 1000);
    }
  }

  disconnectedCallback() {
    if (this._clockTimer) {
      window.clearInterval(this._clockTimer);
      this._clockTimer = null;
    }
  }

  getCardSize() {
    return this._tab === "schedule" ? 10 : 7;
  }

  _language() {
    return this._hass?.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
  }

  _text() {
    return TEXT[this._language()];
  }

  _stateSignature() {
    if (!this._hass) return "";
    return Object.values(this._entities)
      .filter(Boolean)
      .map((entityId) => {
        const state = this._hass.states[entityId];
        return `${entityId}:${state?.state}:${state?.last_updated}`;
      })
      .join("|");
  }

  async _resolveEntities() {
    if (!this._hass || !this._config) return;
    this._resolving = true;
    this._busy = true;
    this._error = null;
    this._render();
    try {
      const registry = await this._hass.callWS({
        type: "config/entity_registry/list",
      });
      const anchor = registry.find(
        (entry) => entry.entity_id === this._config.entity,
      );
      if (!anchor || anchor.platform !== "noopsyche_k7") {
        throw new Error(this._text().configError);
      }
      this._configEntryId = anchor.config_entry_id;
      const related = registry.filter(
        (entry) =>
          entry.platform === "noopsyche_k7" &&
          entry.config_entry_id === this._configEntryId,
      );
      const bySuffix = (suffix) =>
        related.find((entry) => String(entry.unique_id).endsWith(`_${suffix}`))
          ?.entity_id;
      this._entities = {
        mode: bySuffix("operating_mode") || this._config.entity,
        master: bySuffix("manual_output"),
        sync: bySuffix("sync_time"),
        demonstration: bySuffix("demonstration"),
        schedule: bySuffix("schedule"),
      };
      CHANNELS.forEach((channel) => {
        this._entities[channel.key] = bySuffix(`channel_${channel.key}`);
      });
      this._resolved = true;
      await this._loadSchedule(false);
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._busy = false;
      this._resolving = false;
      this._lastStateSignature = this._stateSignature();
      this._render();
    }
  }

  async _responseService(service, serviceData) {
    const result = await this._hass.callWS({
      type: "call_service",
      domain: "noopsyche_k7",
      service,
      service_data: serviceData,
      return_response: true,
    });
    return result?.response ?? result?.service_response ?? result;
  }

  async _loadSchedule(showBusy = true) {
    if (!this._configEntryId) return;
    if (showBusy) {
      this._busy = true;
      this._render();
    }
    try {
      const state = await this._responseService("get_schedule", {
        config_entry_id: this._configEntryId,
      });
      const normalized = {
        device_id: state.device_id,
        model: state.model,
        host: state.host,
        port: state.port,
        auto_mode: Boolean(state.auto_mode),
        manual: Array.isArray(state.manual)
          ? state.manual.map((value, index) =>
              integerInRange(value, 0, 100, `Manual channel ${index}`),
            )
          : [0, 0, 0, 0, 0, 0],
        schedule: normalizeSchedule(state.schedule),
      };
      this._live = normalized;
      this._draft = deepClone(normalized);
      this._manualDraftChanged = false;
      this._error = null;
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      if (showBusy) this._busy = false;
      this._render();
    }
  }

  _isDirty() {
    if (!this._live || !this._draft) return false;
    return JSON.stringify(this._live) !== JSON.stringify(this._draft);
  }

  _state(entityId) {
    return entityId ? this._hass?.states?.[entityId] : undefined;
  }

  _isAvailable() {
    const state = this._state(this._entities.mode);
    return Boolean(state && state.state !== "unavailable" && state.state !== "unknown");
  }

  _mode() {
    return this._state(this._entities.mode)?.state || "unknown";
  }

  _deviceTitle() {
    return (
      this._config?.title ||
      this._state(this._entities.mode)?.attributes?.friendly_name?.replace(
        /\s+(Operating mode|작동 모드)$/i,
        "",
      ) ||
      this._live?.device_id ||
      "Noo-Psyche K7"
    );
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    const t = this._text();
    if (!this._resolved || !this._draft) {
      this.shadowRoot.innerHTML = `
        <style>${this._styles()}</style>
        <ha-card>
          <div class="empty">
            <ha-icon icon="mdi:led-strip-variant"></ha-icon>
            <div>${escapeHtml(this._error || t.loading)}</div>
            ${this._error ? `<button class="button" data-action="resolve">${t.retry}</button>` : ""}
          </div>
        </ha-card>`;
      this._bind();
      return;
    }

    const available = this._isAvailable();
    const mode = this._mode();
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card class="k7-card">
        <header class="header">
          <div class="device-icon"><ha-icon icon="mdi:led-strip-variant"></ha-icon></div>
          <div class="title-block">
            <div class="brand-label">PINK FAM · LIGHTING</div>
            <div class="title">${escapeHtml(this._deviceTitle())}</div>
            <div class="subtitle">${escapeHtml(this._live.model || "K7")} · ${escapeHtml(this._live.device_id || "")}</div>
          </div>
          <div class="status ${available ? "online" : "offline"}">
            <span></span>${available ? t.connected : t.unavailable}
          </div>
        </header>

        <nav class="tabs">
          ${this._tabButton("control", "mdi:tune-variant", t.control)}
          ${this._tabButton("schedule", "mdi:chart-timeline-variant-shimmer", t.schedule)}
          ${this._tabButton("transfer", "mdi:swap-vertical-bold", t.transfer)}
        </nav>

        <main class="content">
          ${this._error ? `<div class="alert"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${escapeHtml(this._error)}</div>` : ""}
          ${this._tab === "control" ? this._controlView(mode, available) : ""}
          ${this._tab === "schedule" ? this._scheduleView() : ""}
          ${this._tab === "transfer" ? this._transferView() : ""}
        </main>
        ${this._busy ? `<div class="busy"><ha-circular-progress active></ha-circular-progress></div>` : ""}
      </ha-card>`;
    this._bind();
    this._updateClock();
  }

  _tabButton(tab, icon, label) {
    return `<button class="tab ${this._tab === tab ? "active" : ""}" data-tab="${tab}">
      <ha-icon icon="${icon}"></ha-icon><span>${label}</span>
    </button>`;
  }

  _controlView(mode, available) {
    const t = this._text();
    const manual = mode === "manual";
    const demoState = this._state(this._entities.demonstration)?.state === "on";
    const stateBrightness = this._state(this._entities.master)?.attributes?.brightness;
    const brightness = Number.isFinite(Number(stateBrightness))
      ? Math.round((Number(stateBrightness) * 100) / 255)
      : Math.max(...this._live.manual);
    return `
      <section class="section mode-section">
        <div class="section-head">
          <div class="mode-copy">
            <span class="mode-icon"><ha-icon icon="${manual ? "mdi:tune-variant" : "mdi:brightness-auto"}"></ha-icon></span>
            <span><span class="eyebrow">${t.mode}</span><strong>${manual ? t.manual : t.automatic}</strong></span>
          </div>
          <div class="segmented">
            <button data-mode="auto" class="${mode === "auto" ? "selected" : ""}" ${!available ? "disabled" : ""}>${t.automatic}</button>
            <button data-mode="manual" class="${manual ? "selected" : ""}" ${!available ? "disabled" : ""}>${t.manual}</button>
          </div>
        </div>
      </section>

      <section class="section actions-grid">
        <div class="clock-tile">
          <span class="eyebrow">${t.systemTime}</span>
          <strong class="clock">--:--:--</strong>
          <div class="tile-actions">
            <button class="small-button" data-action="sync-now"><ha-icon icon="mdi:clock-check-outline"></ha-icon>${t.syncNow}</button>
            <button class="small-button" data-action="sync-custom"><ha-icon icon="mdi:clock-edit-outline"></ha-icon>${t.setTime}</button>
          </div>
        </div>
        <button class="demo-tile ${demoState ? "active" : ""}" data-action="demonstration" ${!this._entities.demonstration || !available ? "disabled" : ""}>
          <ha-icon icon="mdi:play-speed"></ha-icon>
          <span><strong>${t.demonstration}</strong><small>${t.demonstrationHint}</small></span>
          <span class="switch-dot"></span>
        </button>
      </section>

      <section class="section channel-section ${manual ? "" : "disabled-section"}">
        <div class="section-title"><span>${t.manual}</span><small>${t.manualHint}</small></div>
        ${this._sliderRow({
          label: t.master,
          value: brightness,
          color: "var(--k7-pink)",
          entity: this._entities.master,
          role: "master",
          disabled: !manual || !available,
        })}
        ${CHANNELS.map((channel) => {
          const entityId = this._entities[channel.key];
          const stateValue = Number(this._state(entityId)?.state);
          const value = Number.isFinite(stateValue)
            ? stateValue
            : this._live.manual[CHANNELS.indexOf(channel)];
          return this._sliderRow({
            label: this._language() === "ko" ? channel.ko : channel.name,
            value,
            color: channel.color,
            entity: entityId,
            role: "channel",
            disabled: !manual || !available || !entityId,
          });
        }).join("")}
      </section>

      <div class="footer-actions">
        <button class="button" data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon>${t.refresh}</button>
      </div>`;
  }

  _sliderRow({ label, value, color, entity, role, disabled }) {
    const percentage = Math.round(clamp(value, 0, 100));
    const directLabel = `${label} ${this._text().directInput}`;
    return `<div class="slider-row ${disabled ? "disabled" : ""}" style="--channel:${color};--value:${percentage}%">
      <span class="channel-label"><i style="--channel:${color}"></i>${escapeHtml(label)}</span>
      <input type="range" min="0" max="100" step="1" value="${percentage}"
        aria-label="${escapeHtml(label)}" data-control-range
        data-entity="${escapeHtml(entity || "")}" data-role="${role}" ${disabled ? "disabled" : ""}>
      <label class="percent-field">
        <input class="percent-number" type="text" inputmode="numeric" pattern="[0-9]{1,3}"
          maxlength="3" value="${percentage}" aria-label="${escapeHtml(directLabel)}"
          data-control-percent data-entity="${escapeHtml(entity || "")}" data-role="${role}"
          ${disabled ? "disabled" : ""}>
        <span aria-hidden="true">%</span>
      </label>
    </div>`;
  }

  _scheduleView() {
    const t = this._text();
    const slot = this._draft.schedule[this._selectedSlot];
    const dirty = this._isDirty();
    return `
      <section class="chart-section">
        <div class="section-head compact chart-head">
          <div><span class="eyebrow">${t.chart}</span><strong>${dirty ? t.draft : t.live}</strong></div>
          <div class="chart-meta">
            <span class="selected-time"><ha-icon icon="mdi:clock-outline"></ha-icon>${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}</span>
            <span class="draft-state ${dirty ? "dirty" : ""}">${dirty ? t.draft : t.clean}</span>
          </div>
        </div>
        ${this._chartSvg()}
        <div class="legend">${CHANNELS.map((channel, index) => `<span style="--channel:${channel.color}"><i></i><b>${this._language() === "ko" ? channel.ko : channel.name}</b><em>${slot.channels[index]}%</em></span>`).join("")}</div>
      </section>

      <section class="section profile-section">
        <span class="eyebrow">${t.profiles}</span>
        <div class="profile-buttons">
          <button data-profile="sps">SPS</button>
          <button data-profile="lps">LPS</button>
          <button data-profile="mixed">${t.mixed}</button>
        </div>
      </section>

      <section class="section editor-section">
        <div class="section-head compact">
          <div><span class="eyebrow">${t.selectedPoint}</span><strong>${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}</strong></div>
          <label class="minute-input">${t.minute}<input type="text" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" value="${slot.minute}" data-draft-minute></label>
        </div>
        <div class="point-strip">
          ${this._draft.schedule.map((point, index) => `<button class="point ${index === this._selectedSlot ? "selected" : ""}" data-slot="${index}">${String(point.hour).padStart(2, "0")}<small>${String(point.minute).padStart(2, "0")}</small></button>`).join("")}
        </div>
        <div class="draft-channels">
          ${CHANNELS.map((channel, index) => this._draftSlider(channel, index, slot.channels[index])).join("")}
        </div>
        <div class="preview-note"><ha-icon icon="mdi:information-outline"></ha-icon>${t.previewWarning}</div>
        <button class="button warning" data-action="preview"><ha-icon icon="mdi:eye-outline"></ha-icon>${t.preview}</button>
      </section>

      <div class="footer-actions schedule-actions">
        <button class="button" data-action="zero"><ha-icon icon="mdi:numeric-0-box-multiple-outline"></ha-icon>${t.zero}</button>
        <button class="button" data-action="reload"><ha-icon icon="mdi:backup-restore"></ha-icon>${t.reload}</button>
        <button class="button primary" data-action="save-schedule" ${dirty ? "" : "disabled"}><ha-icon icon="mdi:content-save-outline"></ha-icon>${t.save}</button>
      </div>`;
  }

  _draftSlider(channel, index, value) {
    const percentage = integerInRange(value, 0, 100, `Channel ${index}`);
    const label = this._language() === "ko" ? channel.ko : channel.name;
    const directLabel = `${label} ${this._text().directInput}`;
    return `<div class="slider-row" style="--channel:${channel.color};--value:${percentage}%">
      <span class="channel-label"><i style="--channel:${channel.color}"></i>${escapeHtml(label)}</span>
      <input type="range" min="0" max="100" step="1" value="${percentage}"
        aria-label="${escapeHtml(label)}" data-draft-range="${index}">
      <label class="percent-field">
        <input class="percent-number" type="text" inputmode="numeric" pattern="[0-9]{1,3}"
          maxlength="3" value="${percentage}" aria-label="${escapeHtml(directLabel)}"
          data-draft-percent="${index}">
        <span aria-hidden="true">%</span>
      </label>
    </div>`;
  }

  _chartSvg() {
    const { width, height, left, right, top, bottom, hours } = CHART;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const x = (slot) => left + ((slot.hour + slot.minute / 60) / hours) * plotWidth;
    const y = (value) => top + ((100 - value) / 100) * plotHeight;
    const grid = [0, 25, 50, 75, 100]
      .map((value) => `<line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"></line><text x="6" y="${y(value) + 4}">${value}%</text>`)
      .join("");
    const axes = [0, 6, 12, 18, 24]
      .map((hour) => {
        const position = left + (hour / hours) * plotWidth;
        return `<line x1="${position}" y1="${top}" x2="${position}" y2="${top + plotHeight}"></line><text x="${position}" y="${height - 14}" text-anchor="middle">${String(hour).padStart(2, "0")}</text>`;
      })
      .join("");
    const series = CHANNELS.map((channel, channelIndex) => {
      const points = this._draft.schedule
        .map((slot) => ({ x: x(slot), y: y(slot.channels[channelIndex]) }));
      const path = this._smoothPath(points);
      return `<path class="series-glow" d="${path}" stroke="${channel.color}"></path><path class="series-line" d="${path}" stroke="${channel.color}"></path>`;
    }).join("");
    const envelopePoints = this._draft.schedule.map((slot) => ({
      x: x(slot),
      y: y(Math.max(...slot.channels)),
    }));
    const envelope = `${this._smoothPath(envelopePoints)} L ${envelopePoints.at(-1).x.toFixed(1)},${top + plotHeight} L ${envelopePoints[0].x.toFixed(1)},${top + plotHeight} Z`;
    const selected = this._draft.schedule[this._selectedSlot];
    const markerX = x(selected);
    const markers = CHANNELS.map(
      (channel, index) =>
        `<circle cx="${markerX.toFixed(1)}" cy="${y(selected.channels[index]).toFixed(1)}" r="3.2" fill="${channel.color}"></circle>`,
    ).join("");
    return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" data-chart>
      <defs>
        <linearGradient id="k7-chart-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24233a"></stop><stop offset="1" stop-color="#11131b"></stop></linearGradient>
        <linearGradient id="k7-envelope" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4b8b" stop-opacity=".16"></stop><stop offset=".55" stop-color="#7f64ff" stop-opacity=".13"></stop><stop offset="1" stop-color="#35a7ff" stop-opacity=".04"></stop></linearGradient>
      </defs>
      <rect class="plot-bg" x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" rx="16"></rect>
      <g class="grid">${grid}${axes}</g>
      <path class="envelope" d="${envelope}"></path>
      <g class="series">${series}</g>
      <line class="selected-line" x1="${markerX}" y1="${top}" x2="${markerX}" y2="${top + plotHeight}"></line>
      <g class="selected-markers">${markers}</g>
    </svg>`;
  }

  _smoothPath(points) {
    if (!points.length) return "";
    if (points.length === 1) {
      return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    }
    let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let index = 1; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      const middleX = (point.x + next.x) / 2;
      const middleY = (point.y + next.y) / 2;
      path += ` Q ${point.x.toFixed(1)},${point.y.toFixed(1)} ${middleX.toFixed(1)},${middleY.toFixed(1)}`;
    }
    const penultimate = points.at(-2);
    const last = points.at(-1);
    return `${path} Q ${penultimate.x.toFixed(1)},${penultimate.y.toFixed(1)} ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  }

  _scheduleSlotAtSvgX(svgX) {
    const plotWidth = CHART.width - CHART.left - CHART.right;
    const plotRatio = clamp((svgX - CHART.left) / plotWidth, 0, 1);
    const selectedHour = plotRatio * CHART.hours;
    return this._draft.schedule.reduce((nearestIndex, slot, index, schedule) => {
      const slotHour = slot.hour + slot.minute / 60;
      const nearest = schedule[nearestIndex];
      const nearestHour = nearest.hour + nearest.minute / 60;
      return Math.abs(slotHour - selectedHour) < Math.abs(nearestHour - selectedHour)
        ? index
        : nearestIndex;
    }, 0);
  }

  _transferView() {
    const t = this._text();
    const host = this._live.host
      ? `${this._live.host}:${this._live.port || 8266}`
      : this._config.host || "—";
    return `
      <section class="section transfer-section">
        <div class="transfer-icon"><ha-icon icon="mdi:file-export-outline"></ha-icon></div>
        <div><span class="eyebrow">${t.exportTitle}</span><p>${t.exportHint}</p></div>
        <div class="footer-actions left">
          <button class="button" data-action="copy"><ha-icon icon="mdi:content-copy"></ha-icon>${t.copy}</button>
          <button class="button" data-action="download"><ha-icon icon="mdi:download"></ha-icon>${t.download}</button>
        </div>
      </section>

      <section class="section transfer-section">
        <div class="transfer-icon"><ha-icon icon="mdi:file-import-outline"></ha-icon></div>
        <div><span class="eyebrow">${t.importTitle}</span><p>${t.importHint}</p></div>
        <div class="footer-actions left">
          <button class="button" data-action="import-file"><ha-icon icon="mdi:file-upload-outline"></ha-icon>${t.importFile}</button>
          <button class="button" data-action="paste"><ha-icon icon="mdi:clipboard-text-outline"></ha-icon>${t.paste}</button>
          <input type="file" accept="application/json,.json" data-import-file hidden>
        </div>
      </section>

      <section class="section device-section">
        <span class="eyebrow">${t.device}</span>
        <dl>
          <div><dt>${t.host}</dt><dd>${escapeHtml(host)}</dd></div>
          <div><dt>${t.entry}</dt><dd>${escapeHtml(this._configEntryId)}</dd></div>
          <div><dt>${t.entity}</dt><dd>${escapeHtml(this._config.entity)}</dd></div>
          <div><dt>Card</dt><dd>v${CARD_VERSION}</dd></div>
        </dl>
        <div class="card-hint">${t.cardHint}</div>
      </section>`;
  }

  _bindIntegerInput(input, minimum, maximum, message, onValid, syncTarget = null) {
    const field = input.closest(".percent-field");
    const validate = () => {
      try {
        const value = integerInRange(input.value, minimum, maximum, "Value");
        input.setCustomValidity("");
        input.classList.remove("invalid");
        field?.classList.remove("invalid");
        input.setAttribute("aria-invalid", "false");
        if (syncTarget) {
          syncTarget.value = String(value);
          input.closest(".slider-row")?.style.setProperty("--value", `${value}%`);
        }
        return value;
      } catch (_error) {
        input.setCustomValidity(message);
        input.classList.add("invalid");
        field?.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");
        return null;
      }
    };

    input.addEventListener("beforeinput", (event) => {
      if (event.data !== null && !/^\d+$/.test(event.data)) {
        event.preventDefault();
      }
    });
    input.addEventListener("input", validate);
    input.addEventListener("change", async () => {
      const value = validate();
      if (value === null) {
        input.reportValidity();
        return;
      }
      input.value = String(value);
      try {
        await onValid(value);
      } catch (error) {
        this._error = error instanceof Error ? error.message : String(error);
        this._render();
      }
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
    });
  }

  _bind() {
    const t = this._text();
    this.shadowRoot.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        this._tab = button.dataset.tab;
        this._render();
      });
    });
    this.shadowRoot.querySelector('[data-action="resolve"]')?.addEventListener("click", () => {
      this._resolved = false;
      this._resolveEntities();
    });
    this.shadowRoot.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => this._setMode(button.dataset.mode));
    });
    this.shadowRoot.querySelectorAll("[data-control-range]").forEach((input) => {
      const directInput = input.closest(".slider-row").querySelector("[data-control-percent]");
      input.addEventListener("input", () => {
        input.closest(".slider-row").style.setProperty("--value", `${input.value}%`);
        directInput.value = input.value;
        directInput.setCustomValidity("");
        directInput.classList.remove("invalid");
        directInput.closest(".percent-field").classList.remove("invalid");
        directInput.setAttribute("aria-invalid", "false");
      });
      input.addEventListener("change", () => this._setManualValue(input));
    });
    this.shadowRoot.querySelectorAll("[data-control-percent]").forEach((input) => {
      this._bindIntegerInput(
        input,
        0,
        100,
        t.invalidPercent,
        (value) => this._setManualValue(input, value),
        input.closest(".slider-row").querySelector("[data-control-range]"),
      );
    });
    this.shadowRoot.querySelectorAll("[data-profile]").forEach((button) => {
      button.addEventListener("click", () => this._loadProfile(button.dataset.profile));
    });
    this.shadowRoot.querySelectorAll("[data-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        this._selectedSlot = Number(button.dataset.slot);
        this._render();
      });
    });
    const minuteInput = this.shadowRoot.querySelector("[data-draft-minute]");
    if (minuteInput) {
      this._bindIntegerInput(minuteInput, 0, 59, t.invalidMinute, (value) => {
        this._draft.schedule[this._selectedSlot].minute = value;
        this._render();
      });
    }
    this.shadowRoot.querySelectorAll("[data-draft-range]").forEach((input) => {
      const directInput = input.closest(".slider-row").querySelector("[data-draft-percent]");
      input.addEventListener("input", () => {
        input.closest(".slider-row").style.setProperty("--value", `${input.value}%`);
        directInput.value = input.value;
        directInput.setCustomValidity("");
        directInput.classList.remove("invalid");
        directInput.closest(".percent-field").classList.remove("invalid");
        directInput.setAttribute("aria-invalid", "false");
      });
      input.addEventListener("change", () => {
        const index = Number(input.dataset.draftRange);
        this._draft.schedule[this._selectedSlot].channels[index] = integerInRange(
          input.value,
          0,
          100,
          `Channel ${index}`,
        );
        this._render();
      });
    });
    this.shadowRoot.querySelectorAll("[data-draft-percent]").forEach((input) => {
      const index = Number(input.dataset.draftPercent);
      this._bindIntegerInput(
        input,
        0,
        100,
        t.invalidPercent,
        (value) => {
          this._draft.schedule[this._selectedSlot].channels[index] = value;
          this._render();
        },
        input.closest(".slider-row").querySelector("[data-draft-range]"),
      );
    });
    this.shadowRoot.querySelector("[data-chart]")?.addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const svgX = ((event.clientX - rect.left) / rect.width) * CHART.width;
      this._selectedSlot = this._scheduleSlotAtSvgX(svgX);
      this._render();
    });
    this.shadowRoot.querySelectorAll("[data-action]").forEach((button) => {
      if (button.dataset.action === "resolve") return;
      button.addEventListener("click", () => this._handleAction(button.dataset.action));
    });
    this.shadowRoot.querySelector("[data-import-file]")?.addEventListener("change", (event) => this._importFile(event));
  }

  async _handleAction(action) {
    const handlers = {
      "sync-now": () => this._pressSync(),
      "sync-custom": () => this._syncCustomTime(),
      demonstration: () => this._toggleDemonstration(),
      refresh: () => this._refresh(),
      preview: () => this._preview(),
      zero: () => this._zeroDraft(),
      reload: () => this._loadSchedule(),
      "save-schedule": () => this._saveSchedule(),
      copy: () => this._copyExport(),
      download: () => this._downloadExport(),
      "import-file": () => this.shadowRoot.querySelector("[data-import-file]")?.click(),
      paste: () => this._pasteImport(),
    };
    try {
      await handlers[action]?.();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
      this._busy = false;
      this._render();
    }
  }

  async _setMode(mode) {
    await this._hass.callService("select", "select_option", {
      entity_id: this._entities.mode,
      option: mode,
    });
  }

  async _setManualValue(input, rawValue = input.value) {
    const value = integerInRange(rawValue, 0, 100, "Percentage");
    if (input.dataset.role === "master") {
      await this._hass.callService(
        "light",
        value === 0 ? "turn_off" : "turn_on",
        value === 0
          ? { entity_id: input.dataset.entity }
          : { entity_id: input.dataset.entity, brightness_pct: value },
      );
      return;
    }
    await this._hass.callService("number", "set_value", {
      entity_id: input.dataset.entity,
      value,
    });
  }

  async _pressSync() {
    if (!this._entities.sync) return;
    await this._hass.callService("button", "press", {
      entity_id: this._entities.sync,
    });
    this._toast(this._text().timeSynced);
  }

  async _syncCustomTime() {
    const now = new Date();
    const initial = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
    const value = window.prompt("HH:MM:SS", initial);
    if (value === null) return;
    const match = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(value.trim());
    if (!match) {
      this._toast(this._text().invalidTime);
      return;
    }
    const [hour, minute, second] = match.slice(1).map(Number);
    if (hour > 23 || minute > 59 || second > 59) {
      this._toast(this._text().invalidTime);
      return;
    }
    await this._hass.callService("noopsyche_k7", "sync_time", {
      config_entry_id: this._configEntryId,
      hour,
      minute,
      second,
    });
    this._toast(this._text().timeSynced);
  }

  async _toggleDemonstration() {
    const entityId = this._entities.demonstration;
    const state = this._state(entityId)?.state;
    await this._hass.callService("switch", state === "on" ? "turn_off" : "turn_on", {
      entity_id: entityId,
    });
  }

  async _refresh() {
    await this._hass.callService("homeassistant", "update_entity", {
      entity_id: this._entities.mode,
    });
    await this._loadSchedule();
  }

  async _loadProfile(profile) {
    this._busy = true;
    this._render();
    try {
      const result = await this._responseService("get_profile", { profile });
      this._draft.schedule = normalizeSchedule(result.schedule);
      this._draft.manual = result.manual.map((value, index) =>
        integerInRange(value, 0, 100, `Manual channel ${index}`),
      );
      this._manualDraftChanged = true;
      this._toast(this._text().profileLoaded);
    } finally {
      this._busy = false;
      this._render();
    }
  }

  async _preview() {
    const slot = this._draft.schedule[this._selectedSlot];
    await this._hass.callService("noopsyche_k7", "preview", {
      config_entry_id: this._configEntryId,
      channels: slot.channels,
    });
    this._toast(this._text().previewed);
  }

  _zeroDraft() {
    this._draft.schedule.forEach((slot) => {
      slot.channels = [0, 0, 0, 0, 0, 0];
    });
    this._render();
  }

  async _saveSchedule() {
    if (!this._isDirty() || !window.confirm(this._text().saveConfirm)) return;
    this._busy = true;
    this._render();
    try {
      const serviceData = {
        config_entry_id: this._configEntryId,
        auto_mode: this._draft.auto_mode,
        schedule: this._draft.schedule,
      };
      if (this._manualDraftChanged) {
        serviceData.manual = this._draft.manual;
      }
      await this._hass.callService("noopsyche_k7", "set_schedule", serviceData);
      await this._loadSchedule(false);
      this._toast(this._text().saved);
    } finally {
      this._busy = false;
      this._render();
    }
  }

  _exportPayload() {
    return {
      schema: "noopsyche_k7_schedule_v1",
      exported_at: new Date().toISOString(),
      device_id: this._live.device_id,
      model: this._live.model,
      auto_mode: this._draft.auto_mode,
      manual: this._draft.manual,
      schedule: this._draft.schedule,
    };
  }

  async _copyExport() {
    await navigator.clipboard.writeText(JSON.stringify(this._exportPayload(), null, 2));
    this._toast(this._text().copied);
  }

  _downloadExport() {
    const blob = new Blob([JSON.stringify(this._exportPayload(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${this._live.device_id || "noopsyche-k7"}-schedule.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async _importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      this._importPayload(JSON.parse(await file.text()));
    } catch (_error) {
      this._toast(this._text().invalidImport);
    } finally {
      event.target.value = "";
    }
  }

  _pasteImport() {
    const value = window.prompt("K7 schedule JSON");
    if (value === null) return;
    try {
      this._importPayload(JSON.parse(value));
    } catch (_error) {
      this._toast(this._text().invalidImport);
    }
  }

  _importPayload(payload) {
    const schedule = normalizeSchedule(payload?.schedule ?? payload);
    this._draft.schedule = schedule;
    if (Array.isArray(payload?.manual) && payload.manual.length === 6) {
      this._draft.manual = payload.manual.map((value, index) =>
        integerInRange(value, 0, 100, `Manual channel ${index}`),
      );
      this._manualDraftChanged = true;
    }
    this._tab = "schedule";
    this._toast(this._text().imported);
    this._render();
  }

  _toast(message) {
    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        detail: { message },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _updateClock() {
    const target = this.shadowRoot?.querySelector(".clock");
    if (!target) return;
    target.textContent = new Intl.DateTimeFormat(this._hass?.locale?.language || undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  }

  _styles() {
    return `
      :host {
        --k7-bg: #0d1018;
        --k7-surface: #15151b;
        --k7-panel: #191a22;
        --k7-elevated: #22232d;
        --k7-soft: rgba(255, 255, 255, .045);
        --k7-line: rgba(255, 255, 255, .095);
        --k7-text: #f8f5fa;
        --k7-muted: #9895a1;
        --k7-pink: #ff4b8b;
        --k7-blue: #35a7ff;
        --primary-color: var(--k7-pink);
        --primary-text-color: var(--k7-text);
        --secondary-text-color: var(--k7-muted);
        --text-primary-color: #fff;
        --error-color: #ff657f;
        display: block;
        color: var(--k7-text);
      }
      * { box-sizing: border-box; }
      ha-card { position: relative; display: block; overflow: hidden; padding: 0; border: 1px solid var(--k7-line); border-radius: 24px; color: var(--k7-text); background: radial-gradient(circle at 86% -15%, rgba(255,75,139,.22), transparent 32%), radial-gradient(circle at 5% 8%, rgba(53,167,255,.13), transparent 25%), linear-gradient(145deg, #131217 0%, var(--k7-bg) 100%); box-shadow: 0 24px 60px rgba(0,0,0,.28); }
      button, input { font: inherit; }
      button { border: 0; color: inherit; }
      .header { display: flex; align-items: center; gap: 16px; min-height: 118px; padding: 24px 28px; border-bottom: 1px solid var(--k7-line); background: linear-gradient(120deg, rgba(30,45,88,.68), rgba(43,20,39,.64)); }
      .device-icon { display: grid; place-items: center; width: 58px; height: 58px; flex: 0 0 auto; border: 1px solid rgba(255,75,139,.3); border-radius: 19px; color: var(--k7-pink); background: rgba(255,75,139,.13); box-shadow: 0 12px 30px rgba(255,75,139,.12); }
      .device-icon ha-icon { --mdc-icon-size: 30px; }
      .title-block { min-width: 0; flex: 1; }
      .brand-label { margin-bottom: 5px; color: #ff83ad; font-size: 10px; font-weight: 800; letter-spacing: .2em; }
      .title { overflow: hidden; font-size: 24px; font-weight: 720; letter-spacing: -.025em; text-overflow: ellipsis; white-space: nowrap; }
      .subtitle { margin-top: 5px; color: var(--k7-muted); font-size: 11px; }
      .status { display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border: 1px solid var(--k7-line); border-radius: 999px; background: rgba(6,8,15,.38); font-size: 10px; font-weight: 800; white-space: nowrap; }
      .status span { width: 7px; height: 7px; border-radius: 50%; }
      .status.online { color: #67e99d; }
      .status.online span { background: #48dd8b; box-shadow: 0 0 12px #48dd8b; }
      .status.offline { color: var(--error-color); }
      .status.offline span { background: var(--error-color); }
      .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin: 14px 18px 0; padding: 5px; border: 1px solid rgba(255,255,255,.055); border-radius: 15px; background: rgba(255,255,255,.035); }
      .tab { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 42px; padding: 8px; border-radius: 11px; background: transparent; color: var(--k7-muted); cursor: pointer; transition: .18s ease; }
      .tab ha-icon { --mdc-icon-size: 18px; }
      .tab:hover { color: var(--k7-text); background: rgba(255,255,255,.04); }
      .tab.active { color: #fff; background: linear-gradient(135deg, rgba(255,75,139,.92), rgba(185,64,145,.86)); box-shadow: 0 9px 24px rgba(255,75,139,.16); }
      .content { padding: 18px; }
      .section, .chart-section { margin-bottom: 14px; padding: 18px; border: 1px solid var(--k7-line); border-radius: 20px; background: linear-gradient(145deg, rgba(25,25,32,.98), rgba(18,19,25,.98)); }
      .section-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .section-head > div:first-child { display: flex; flex-direction: column; gap: 3px; }
      .section-head.compact strong { font-size: 19px; }
      .eyebrow { color: var(--k7-muted); font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .mode-section { border-left: 3px solid var(--k7-pink); background: radial-gradient(circle at 8% 30%, rgba(255,75,139,.1), transparent 28%), linear-gradient(145deg, rgba(25,25,32,.98), rgba(18,19,25,.98)); }
      .mode-copy { display: flex !important; flex-direction: row !important; align-items: center; gap: 12px !important; }
      .mode-copy > span:last-child { display: flex; flex-direction: column; gap: 3px; }
      .mode-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; color: var(--k7-pink); background: rgba(255,75,139,.12); }
      .mode-icon ha-icon { --mdc-icon-size: 22px; }
      .segmented { display: grid; grid-template-columns: 1fr 1fr; min-width: 210px; padding: 4px; border: 1px solid rgba(255,255,255,.055); border-radius: 13px; background: rgba(255,255,255,.04); }
      .segmented button, .profile-buttons button { border-radius: 10px; background: transparent; padding: 9px 13px; cursor: pointer; }
      .segmented button.selected { color: #fff; background: linear-gradient(135deg, var(--k7-pink), #d84180); box-shadow: 0 7px 18px rgba(255,75,139,.18); }
      button:disabled { cursor: not-allowed; opacity: .45; }
      .actions-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px; padding: 0; border: 0; background: transparent; }
      .clock-tile, .demo-tile { min-height: 118px; padding: 18px; border: 1px solid var(--k7-line); border-radius: 20px; background: linear-gradient(145deg, var(--k7-panel), #131319); }
      .clock-tile { display: flex; flex-direction: column; }
      .clock { margin: 5px 0 11px; color: #fff; font-size: 28px; font-variant-numeric: tabular-nums; letter-spacing: -.03em; }
      .tile-actions { display: flex; flex-wrap: wrap; gap: 6px; }
      .small-button { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.055); border-radius: 9px; background: var(--k7-elevated); color: #c6c1ca; cursor: pointer; font-size: 10px; font-weight: 700; }
      .small-button:hover { color: #fff; background: color-mix(in srgb, var(--k7-pink) 13%, var(--k7-elevated)); }
      .small-button ha-icon { --mdc-icon-size: 15px; }
      .demo-tile { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; text-align: left; cursor: pointer; }
      .demo-tile > ha-icon { color: var(--k7-pink); --mdc-icon-size: 29px; }
      .demo-tile span { display: flex; flex-direction: column; gap: 4px; }
      .demo-tile small { color: var(--k7-muted); line-height: 1.4; }
      .switch-dot { position: relative; width: 39px; height: 22px; border-radius: 999px; background: #30313b; }
      .switch-dot::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #d8d4da; transition: transform .2s; }
      .demo-tile.active { border-color: rgba(255,75,139,.34); box-shadow: inset 3px 0 0 var(--k7-pink); }
      .demo-tile.active .switch-dot { background: var(--k7-pink); }
      .demo-tile.active .switch-dot::after { transform: translateX(17px); background: #fff; }
      .section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; margin-bottom: 10px; }
      .section-title span { font-weight: 750; }
      .section-title small { color: var(--k7-muted); text-align: right; }
      .slider-row { display: grid; grid-template-columns: minmax(110px, .8fr) minmax(160px, 2fr) 70px; align-items: center; gap: 14px; min-height: 54px; margin-top: 7px; padding: 9px 11px; border: 1px solid rgba(255,255,255,.065); border-radius: 14px; background: rgba(255,255,255,.028); transition: border-color .18s, background .18s; }
      .slider-row:hover { border-color: color-mix(in srgb, var(--channel) 32%, var(--k7-line)); background: color-mix(in srgb, var(--channel) 5%, var(--k7-soft)); }
      .channel-label { display: flex; align-items: center; gap: 9px; color: #d8d4dc; font-size: 12px; font-weight: 700; }
      .channel-label i, .legend i { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: var(--channel); box-shadow: 0 0 11px color-mix(in srgb, var(--channel) 72%, transparent); }
      input[type="range"] { width: 100%; height: 5px; border-radius: 99px; outline: 0; appearance: none; -webkit-appearance: none; background: linear-gradient(90deg, var(--channel) 0 var(--value), #30313a var(--value) 100%); cursor: pointer; }
      input[type="range"]::-webkit-slider-thumb { width: 18px; height: 18px; border: 3px solid #171820; border-radius: 50%; appearance: none; -webkit-appearance: none; background: var(--channel); box-shadow: 0 0 0 2px color-mix(in srgb, var(--channel) 35%, transparent), 0 0 15px color-mix(in srgb, var(--channel) 32%, transparent); }
      input[type="range"]::-moz-range-thumb { width: 13px; height: 13px; border: 3px solid #171820; border-radius: 50%; background: var(--channel); box-shadow: 0 0 0 2px color-mix(in srgb, var(--channel) 35%, transparent); }
      .percent-field { display: flex; align-items: center; justify-content: flex-end; gap: 2px; padding: 6px 8px; border: 1px solid var(--k7-line); border-radius: 10px; background: var(--k7-elevated); color: var(--k7-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
      .percent-field:focus-within { border-color: var(--channel); box-shadow: 0 0 0 1px color-mix(in srgb, var(--channel) 55%, transparent); }
      .percent-number { width: 38px; min-width: 0; padding: 1px; border: 0; outline: 0; color: var(--channel); background: transparent; text-align: right; font-weight: 800; font-variant-numeric: tabular-nums; }
      .percent-field.invalid, .minute-input input.invalid { border-color: var(--error-color); box-shadow: 0 0 0 1px var(--error-color); }
      .disabled-section { opacity: .68; }
      .disabled-section .slider-row { opacity: .55; }
      .chart-section { padding: 19px; border-color: rgba(126,103,215,.2); background: radial-gradient(circle at 82% 0, rgba(255,75,139,.1), transparent 25%), linear-gradient(145deg, #181821, #111219); }
      .chart-meta { display: flex; align-items: center; gap: 7px; }
      .selected-time { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 1px solid rgba(255,255,255,.07); border-radius: 10px; color: #e7e2e9; background: rgba(255,255,255,.035); font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums; }
      .selected-time ha-icon { color: var(--k7-pink); --mdc-icon-size: 15px; }
      .draft-state { padding: 7px 9px; border-radius: 10px; color: var(--k7-muted); background: rgba(255,255,255,.04); font-size: 10px; font-weight: 700; }
      .draft-state.dirty { color: #ffbf64; background: rgba(255,166,0,.11); }
      .chart { display: block; width: 100%; margin: 10px 0 12px; cursor: crosshair; overflow: visible; }
      .plot-bg { fill: url(#k7-chart-bg); stroke: rgba(255,255,255,.07); }
      .grid line { stroke: rgba(255,255,255,.075); stroke-width: 1; }
      .grid text { fill: #777582; font-size: 10px; font-weight: 650; }
      .envelope { fill: url(#k7-envelope); pointer-events: none; }
      .series path { fill: none; vector-effect: non-scaling-stroke; }
      .series-glow { opacity: .13; stroke-width: 8; }
      .series-line { stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.35; }
      .selected-line { opacity: .55; stroke: #fff; stroke-width: 1; stroke-dasharray: 3 5; pointer-events: none; vector-effect: non-scaling-stroke; }
      .selected-markers { pointer-events: none; }
      .selected-markers circle { stroke: #11131b; stroke-width: 1.5; vector-effect: non-scaling-stroke; }
      .legend { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
      .legend span { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 6px; min-width: 0; padding: 8px 9px; border: 1px solid rgba(255,255,255,.06); border-radius: 11px; background: rgba(255,255,255,.028); }
      .legend b { overflow: hidden; color: #bcb7c1; font-size: 9px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
      .legend em { color: var(--channel); font-size: 10px; font-style: normal; font-weight: 850; font-variant-numeric: tabular-nums; }
      .profile-section { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .profile-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
      .profile-buttons button { border: 1px solid var(--k7-line); padding: 9px 13px; color: #c5c0c9; background: var(--k7-elevated); }
      .profile-buttons button:hover { border-color: var(--k7-pink); color: #fff; background: rgba(255,75,139,.1); }
      .minute-input { display: flex; align-items: center; gap: 7px; color: var(--k7-muted); font-size: 11px; font-weight: 700; }
      .minute-input input { width: 58px; padding: 8px; border: 1px solid var(--k7-line); border-radius: 10px; outline: 0; color: var(--k7-pink); background: var(--k7-elevated); text-align: center; font-weight: 800; }
      .minute-input input:focus { border-color: var(--k7-pink); box-shadow: 0 0 0 1px rgba(255,75,139,.35); }
      .point-strip { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 5px; margin: 15px 0; }
      .point { display: flex; flex-direction: column; align-items: center; padding: 8px 3px; border: 1px solid rgba(255,255,255,.065); border-radius: 10px; background: rgba(255,255,255,.025); color: #bbb7c0; cursor: pointer; font-size: 10px; }
      .point:hover { border-color: rgba(255,75,139,.35); background: rgba(255,75,139,.06); }
      .point small { color: #777480; font-size: 8px; }
      .point.selected { color: #fff; border-color: var(--k7-pink); background: linear-gradient(145deg, var(--k7-pink), #bf478d); box-shadow: 0 7px 18px rgba(255,75,139,.2); }
      .point.selected small { color: inherit; opacity: .8; }
      .preview-note { display: flex; align-items: center; gap: 6px; margin: 12px 0 9px; color: var(--k7-muted); font-size: 10px; }
      .preview-note ha-icon { --mdc-icon-size: 16px; }
      .footer-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
      .footer-actions.left { justify-content: flex-start; }
      .button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 41px; padding: 9px 13px; border: 1px solid var(--k7-line); border-radius: 12px; color: #c7c2ca; background: var(--k7-elevated); cursor: pointer; font-size: 11px; font-weight: 750; }
      .button:hover { color: #fff; border-color: rgba(255,255,255,.16); background: #292a34; }
      .button ha-icon { --mdc-icon-size: 18px; }
      .button.primary { color: #fff; border-color: var(--k7-pink); background: linear-gradient(135deg, var(--k7-pink), #d43f7e); box-shadow: 0 8px 22px rgba(255,75,139,.18); }
      .button.warning { color: #ffc268; border-color: rgba(255,174,57,.32); background: rgba(255,174,57,.07); }
      .schedule-actions { padding-bottom: 2px; }
      .transfer-section { display: grid; grid-template-columns: auto 1fr; gap: 12px; }
      .transfer-section .footer-actions { grid-column: 2; }
      .transfer-icon { display: grid; place-items: center; width: 45px; height: 45px; border: 1px solid rgba(255,75,139,.22); border-radius: 14px; color: var(--k7-pink); background: rgba(255,75,139,.11); }
      .transfer-section p { margin: 5px 0 0; color: var(--k7-muted); font-size: 11px; line-height: 1.55; }
      .device-section dl { margin: 8px 0 0; }
      .device-section dl div { display: grid; grid-template-columns: 95px 1fr; gap: 10px; padding: 10px 0; border-top: 1px solid var(--k7-line); }
      .device-section dt { color: var(--k7-muted); }
      .device-section dd { margin: 0; overflow-wrap: anywhere; }
      .card-hint { margin-top: 8px; padding: 11px; border-radius: 10px; color: var(--k7-muted); background: var(--k7-soft); font: 10px/1.5 monospace; }
      .alert { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; padding: 11px; border: 1px solid rgba(255,101,127,.2); border-radius: 12px; color: var(--error-color); background: rgba(255,101,127,.08); }
      .alert ha-icon { --mdc-icon-size: 18px; }
      .busy { position: absolute; inset: 0; display: grid; place-items: center; z-index: 3; background: rgba(13,16,24,.8); backdrop-filter: blur(3px); }
      .empty { display: grid; place-items: center; gap: 10px; min-height: 220px; padding: 28px; color: var(--k7-muted); text-align: center; }
      .empty > ha-icon { color: var(--k7-pink); --mdc-icon-size: 44px; }
      @media (max-width: 700px) {
        ha-card { border-radius: 19px; }
        .header { min-height: 102px; padding: 20px 18px; }
        .device-icon { width: 50px; height: 50px; border-radius: 16px; }
        .title { font-size: 21px; }
        .brand-label { font-size: 9px; }
        .status { padding: 7px 9px; font-size: 9px; }
        .tabs { margin: 11px 12px 0; }
        .tab { font-size: 10px; }
        .content { padding: 12px; }
        .actions-grid { grid-template-columns: 1fr; }
        .section-head { align-items: flex-start; }
        .mode-section .section-head { flex-direction: column; }
        .segmented { width: 100%; }
        .section-title { flex-direction: column; gap: 3px; }
        .section-title small { text-align: left; }
        .slider-row { grid-template-columns: minmax(90px, 1fr) 70px; gap: 10px; padding: 10px; }
        .slider-row > input[type="range"] { grid-column: 1 / -1; grid-row: 2; }
        .slider-row > .percent-field { grid-column: 2; grid-row: 1; }
        .chart-section { padding: 13px; }
        .chart-head { align-items: flex-start; gap: 9px; }
        .chart-meta { flex-wrap: wrap; justify-content: flex-end; }
        .legend { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .point-strip { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .profile-section { align-items: flex-start; flex-direction: column; }
        .footer-actions .button { flex: 1 1 135px; }
      }
      @media (max-width: 430px) {
        .header { gap: 11px; padding: 17px 14px; }
        .device-icon { width: 45px; height: 45px; }
        .title { font-size: 18px; }
        .subtitle { font-size: 9px; }
        .status { padding: 6px 7px; }
        .tabs { margin-inline: 9px; }
        .tab { gap: 4px; padding-inline: 4px; font-size: 9px; }
        .tab ha-icon { --mdc-icon-size: 16px; }
        .section, .chart-section { border-radius: 16px; }
        .chart-meta { justify-content: flex-start; }
        .point-strip { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      }
    `;
  }
}

if (!customElements.get("noopsyche-k7-card")) {
  customElements.define("noopsyche-k7-card", NooPsycheK7Card);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "noopsyche-k7-card")) {
  window.customCards.push({
    type: "noopsyche-k7-card",
    name: "Noo-Psyche K7 Dashboard",
    description: "App-style control, schedule editing, profiles, and transfer UI for Noo-Psyche K7.",
    preview: true,
  });
}

console.info(`%c Noo-Psyche K7 card %c v${CARD_VERSION} `, "color:#fff;background:#03a9f4;font-weight:700", "color:#03a9f4;background:#eef8fc");
