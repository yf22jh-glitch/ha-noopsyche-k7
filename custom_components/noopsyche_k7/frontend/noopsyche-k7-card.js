const CARD_VERSION = "0.2.0";

const CHANNELS = [
  { key: "white", name: "White", ko: "화이트", color: "#c8d4dc" },
  { key: "royal_blue", name: "Royal Blue", ko: "로열 블루", color: "#246bdb" },
  { key: "green", name: "Green", ko: "그린", color: "#2ca56c" },
  { key: "uv", name: "UV", ko: "UV", color: "#8d5bd6" },
  { key: "blue", name: "Blue", ko: "블루", color: "#00a9e8" },
  { key: "red", name: "Red", ko: "레드", color: "#e45c4c" },
];

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

const finiteNumber = (value, label) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a finite number`);
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
      hour: clamp(finiteNumber(slot.hour ?? index, `Point ${index} hour`), 0, 23),
      minute: clamp(finiteNumber(slot.minute ?? 0, `Point ${index} minute`), 0, 59),
      channels: slot.channels.map((channel, channelIndex) =>
        clamp(
          finiteNumber(channel, `Point ${index} channel ${channelIndex}`),
          0,
          100,
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
          ? state.manual.map((value) => clamp(value, 0, 100))
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
          <div><span class="eyebrow">${t.mode}</span><strong>${manual ? t.manual : t.automatic}</strong></div>
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
          color: "var(--primary-color)",
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
    return `<label class="slider-row ${disabled ? "disabled" : ""}">
      <span class="channel-label"><i style="--channel:${color}"></i>${escapeHtml(label)}</span>
      <input type="range" min="0" max="100" step="1" value="${clamp(value, 0, 100)}"
        data-entity="${escapeHtml(entity || "")}" data-role="${role}" ${disabled ? "disabled" : ""}>
      <output>${Math.round(clamp(value, 0, 100))}%</output>
    </label>`;
  }

  _scheduleView() {
    const t = this._text();
    const slot = this._draft.schedule[this._selectedSlot];
    const dirty = this._isDirty();
    return `
      <section class="chart-section">
        <div class="section-head compact">
          <div><span class="eyebrow">${t.chart}</span><strong>${dirty ? t.draft : t.live}</strong></div>
          <span class="draft-state ${dirty ? "dirty" : ""}">${dirty ? t.draft : t.clean}</span>
        </div>
        ${this._chartSvg()}
        <div class="legend">${CHANNELS.map((channel) => `<span><i style="--channel:${channel.color}"></i>${this._language() === "ko" ? channel.ko : channel.name}</span>`).join("")}</div>
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
          <label class="minute-input">${t.minute}<input type="number" min="0" max="59" value="${slot.minute}" data-draft-minute></label>
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
    return `<label class="slider-row">
      <span class="channel-label"><i style="--channel:${channel.color}"></i>${this._language() === "ko" ? channel.ko : channel.name}</span>
      <input type="range" min="0" max="100" step="1" value="${value}" data-draft-channel="${index}">
      <output>${Math.round(value)}%</output>
    </label>`;
  }

  _chartSvg() {
    const width = 720;
    const left = 42;
    const right = 20;
    const top = 22;
    const bottom = 38;
    const plotWidth = width - left - right;
    const plotHeight = 230 - top - bottom;
    const x = (slot) => left + ((slot.hour + slot.minute / 60) / 23) * plotWidth;
    const y = (value) => top + ((100 - value) / 100) * plotHeight;
    const grid = [0, 25, 50, 75, 100]
      .map((value) => `<line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"></line><text x="4" y="${y(value) + 4}">${value}%</text>`)
      .join("");
    const axes = [0, 6, 12, 18, 23]
      .map((hour) => {
        const position = left + (hour / 23) * plotWidth;
        return `<line x1="${position}" y1="${top}" x2="${position}" y2="${top + plotHeight}"></line><text x="${position}" y="218" text-anchor="middle">${String(hour).padStart(2, "0")}</text>`;
      })
      .join("");
    const series = CHANNELS.map((channel, channelIndex) => {
      const points = this._draft.schedule
        .map((slot) => `${x(slot).toFixed(1)},${y(slot.channels[channelIndex]).toFixed(1)}`)
        .join(" ");
      return `<polyline points="${points}" stroke="${channel.color}"></polyline>`;
    }).join("");
    const selected = this._draft.schedule[this._selectedSlot];
    const markerX = x(selected);
    return `<svg class="chart" viewBox="0 0 ${width} 230" role="img" data-chart>
      <g class="grid">${grid}${axes}</g>
      <g class="series">${series}</g>
      <line class="selected-line" x1="${markerX}" y1="${top}" x2="${markerX}" y2="${top + plotHeight}"></line>
    </svg>`;
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

  _bind() {
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
    this.shadowRoot.querySelectorAll('input[type="range"][data-entity]').forEach((input) => {
      input.addEventListener("input", () => {
        input.closest("label").querySelector("output").textContent = `${input.value}%`;
      });
      input.addEventListener("change", () => this._setManualValue(input));
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
    this.shadowRoot.querySelector("[data-draft-minute]")?.addEventListener("change", (event) => {
      this._draft.schedule[this._selectedSlot].minute = clamp(event.target.value, 0, 59);
      this._render();
    });
    this.shadowRoot.querySelectorAll("[data-draft-channel]").forEach((input) => {
      input.addEventListener("input", () => {
        input.closest("label").querySelector("output").textContent = `${input.value}%`;
      });
      input.addEventListener("change", () => {
        const index = Number(input.dataset.draftChannel);
        this._draft.schedule[this._selectedSlot].channels[index] = clamp(input.value, 0, 100);
        this._render();
      });
    });
    this.shadowRoot.querySelector("[data-chart]")?.addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const plotRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      this._selectedSlot = Math.round(plotRatio * 23);
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

  async _setManualValue(input) {
    const value = clamp(input.value, 0, 100);
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
      this._draft.manual = result.manual.map((value) => clamp(value, 0, 100));
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
      this._draft.manual = payload.manual.map((value) => clamp(value, 0, 100));
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
        --k7-surface: var(--ha-card-background, var(--card-background-color, #fff));
        --k7-soft: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
        --k7-line: color-mix(in srgb, var(--primary-text-color) 13%, transparent);
        display: block;
      }
      * { box-sizing: border-box; }
      ha-card { position: relative; overflow: hidden; color: var(--primary-text-color); }
      button, input { font: inherit; }
      button { color: inherit; }
      .header { display: flex; align-items: center; gap: 12px; padding: 18px 18px 14px; }
      .device-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 16px; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 15%, transparent); }
      .device-icon ha-icon { --mdc-icon-size: 27px; }
      .title-block { min-width: 0; flex: 1; }
      .title { font-size: 19px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .subtitle { margin-top: 3px; color: var(--secondary-text-color); font-size: 12px; }
      .status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px; border-radius: 999px; font-size: 12px; white-space: nowrap; }
      .status span { width: 7px; height: 7px; border-radius: 50%; }
      .status.online { color: #168650; background: color-mix(in srgb, #2ca56c 14%, transparent); }
      .status.online span { background: #2ca56c; box-shadow: 0 0 0 3px color-mix(in srgb, #2ca56c 18%, transparent); }
      .status.offline { color: var(--error-color); background: color-mix(in srgb, var(--error-color) 12%, transparent); }
      .status.offline span { background: var(--error-color); }
      .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin: 0 14px; padding: 5px; border-radius: 13px; background: var(--k7-soft); }
      .tab { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 39px; padding: 7px; border: 0; border-radius: 9px; background: transparent; color: var(--secondary-text-color); cursor: pointer; }
      .tab ha-icon { --mdc-icon-size: 18px; }
      .tab.active { color: var(--primary-text-color); background: var(--k7-surface); box-shadow: 0 1px 5px rgb(0 0 0 / 9%); }
      .content { padding: 14px; }
      .section, .chart-section { margin-bottom: 12px; padding: 14px; border: 1px solid var(--k7-line); border-radius: 14px; background: var(--k7-surface); }
      .section-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .section-head > div:first-child { display: flex; flex-direction: column; gap: 3px; }
      .section-head.compact strong { font-size: 17px; }
      .eyebrow { color: var(--secondary-text-color); font-size: 11px; font-weight: 650; letter-spacing: .05em; text-transform: uppercase; }
      .segmented { display: grid; grid-template-columns: 1fr 1fr; min-width: 190px; padding: 3px; border-radius: 10px; background: var(--k7-soft); }
      .segmented button, .profile-buttons button { border: 0; border-radius: 8px; background: transparent; padding: 8px 12px; cursor: pointer; }
      .segmented button.selected { background: var(--primary-color); color: var(--text-primary-color, white); }
      button:disabled { cursor: not-allowed; opacity: .45; }
      .actions-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px; padding: 0; border: 0; background: transparent; }
      .clock-tile, .demo-tile { min-height: 105px; padding: 14px; border: 1px solid var(--k7-line); border-radius: 14px; background: var(--k7-surface); }
      .clock-tile { display: flex; flex-direction: column; }
      .clock { margin: 4px 0 9px; font-size: 25px; font-variant-numeric: tabular-nums; }
      .tile-actions { display: flex; flex-wrap: wrap; gap: 6px; }
      .small-button { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border: 0; border-radius: 7px; background: var(--k7-soft); cursor: pointer; font-size: 11px; }
      .small-button ha-icon { --mdc-icon-size: 15px; }
      .demo-tile { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; text-align: left; cursor: pointer; }
      .demo-tile > ha-icon { color: var(--primary-color); --mdc-icon-size: 28px; }
      .demo-tile span { display: flex; flex-direction: column; gap: 4px; }
      .demo-tile small { color: var(--secondary-text-color); line-height: 1.35; }
      .switch-dot { width: 35px; height: 20px; border-radius: 999px; background: var(--k7-line); position: relative; }
      .switch-dot::after { content: ""; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--k7-surface); transition: transform .2s; }
      .demo-tile.active .switch-dot { background: var(--primary-color); }
      .demo-tile.active .switch-dot::after { transform: translateX(15px); }
      .section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; margin-bottom: 5px; }
      .section-title span { font-weight: 650; }
      .section-title small { color: var(--secondary-text-color); text-align: right; }
      .slider-row { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(145px, 2fr) 46px; align-items: center; gap: 10px; min-height: 46px; border-top: 1px solid var(--k7-line); }
      .channel-label { display: flex; align-items: center; gap: 8px; font-size: 13px; }
      .channel-label i, .legend i { width: 9px; height: 9px; border-radius: 50%; background: var(--channel); box-shadow: 0 0 0 3px color-mix(in srgb, var(--channel) 18%, transparent); }
      input[type="range"] { width: 100%; accent-color: var(--primary-color); }
      output { color: var(--secondary-text-color); font-size: 12px; text-align: right; font-variant-numeric: tabular-nums; }
      .disabled-section { opacity: .68; }
      .disabled-section .slider-row { opacity: .55; }
      .chart-section { padding-bottom: 10px; }
      .draft-state { padding: 5px 8px; border-radius: 999px; color: var(--secondary-text-color); background: var(--k7-soft); font-size: 11px; }
      .draft-state.dirty { color: #a66500; background: color-mix(in srgb, #ff9800 16%, transparent); }
      .chart { display: block; width: 100%; margin-top: 9px; cursor: crosshair; overflow: visible; }
      .grid line { stroke: var(--k7-line); stroke-width: 1; }
      .grid text { fill: var(--secondary-text-color); font-size: 10px; }
      .series polyline { fill: none; stroke-width: 2.2; vector-effect: non-scaling-stroke; }
      .selected-line { stroke: var(--primary-color); stroke-width: 1.5; stroke-dasharray: 4 4; vector-effect: non-scaling-stroke; }
      .legend { display: flex; flex-wrap: wrap; gap: 8px 13px; color: var(--secondary-text-color); font-size: 10px; }
      .legend span { display: inline-flex; align-items: center; gap: 5px; }
      .profile-section { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .profile-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
      .profile-buttons button { border: 1px solid var(--k7-line); padding: 7px 11px; }
      .profile-buttons button:hover { border-color: var(--primary-color); color: var(--primary-color); }
      .minute-input { display: flex; align-items: center; gap: 7px; color: var(--secondary-text-color); font-size: 12px; }
      .minute-input input { width: 58px; padding: 6px; border: 1px solid var(--k7-line); border-radius: 8px; color: var(--primary-text-color); background: var(--k7-surface); }
      .point-strip { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; margin: 12px 0; }
      .point { display: flex; flex-direction: column; align-items: center; padding: 6px 2px; border: 1px solid var(--k7-line); border-radius: 7px; background: transparent; cursor: pointer; font-size: 11px; }
      .point small { color: var(--secondary-text-color); font-size: 8px; }
      .point.selected { color: var(--text-primary-color, white); border-color: var(--primary-color); background: var(--primary-color); }
      .point.selected small { color: inherit; opacity: .8; }
      .preview-note { display: flex; align-items: center; gap: 6px; margin: 9px 0; color: var(--secondary-text-color); font-size: 11px; }
      .preview-note ha-icon { --mdc-icon-size: 16px; }
      .footer-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
      .footer-actions.left { justify-content: flex-start; }
      .button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 38px; padding: 8px 12px; border: 1px solid var(--k7-line); border-radius: 10px; background: var(--k7-surface); cursor: pointer; }
      .button ha-icon { --mdc-icon-size: 18px; }
      .button.primary { color: var(--text-primary-color, white); border-color: var(--primary-color); background: var(--primary-color); }
      .button.warning { color: #a66500; border-color: color-mix(in srgb, #ff9800 45%, var(--k7-line)); }
      .schedule-actions { padding-bottom: 2px; }
      .transfer-section { display: grid; grid-template-columns: auto 1fr; gap: 12px; }
      .transfer-section .footer-actions { grid-column: 2; }
      .transfer-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 13%, transparent); }
      .transfer-section p { margin: 5px 0 0; color: var(--secondary-text-color); font-size: 12px; line-height: 1.5; }
      .device-section dl { margin: 8px 0 0; }
      .device-section dl div { display: grid; grid-template-columns: 95px 1fr; gap: 10px; padding: 8px 0; border-top: 1px solid var(--k7-line); }
      .device-section dt { color: var(--secondary-text-color); }
      .device-section dd { margin: 0; overflow-wrap: anywhere; }
      .card-hint { margin-top: 8px; padding: 9px; border-radius: 8px; color: var(--secondary-text-color); background: var(--k7-soft); font: 11px/1.45 monospace; }
      .alert { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; padding: 10px; border-radius: 10px; color: var(--error-color); background: color-mix(in srgb, var(--error-color) 10%, transparent); }
      .alert ha-icon { --mdc-icon-size: 18px; }
      .busy { position: absolute; inset: 0; display: grid; place-items: center; z-index: 3; background: color-mix(in srgb, var(--k7-surface) 78%, transparent); backdrop-filter: blur(1px); }
      .empty { display: grid; place-items: center; gap: 10px; min-height: 180px; padding: 25px; color: var(--secondary-text-color); text-align: center; }
      .empty > ha-icon { color: var(--primary-color); --mdc-icon-size: 42px; }
      @media (max-width: 620px) {
        .header { padding: 14px; }
        .status { padding: 5px 7px; font-size: 10px; }
        .tab { font-size: 11px; }
        .content { padding: 10px; }
        .actions-grid { grid-template-columns: 1fr; }
        .section-head { align-items: flex-start; }
        .mode-section .section-head { flex-direction: column; }
        .segmented { width: 100%; }
        .section-title { flex-direction: column; gap: 3px; }
        .section-title small { text-align: left; }
        .slider-row { grid-template-columns: minmax(90px, 1fr) 46px; padding: 7px 0; }
        .slider-row input { grid-column: 1 / -1; grid-row: 2; }
        .slider-row output { grid-column: 2; grid-row: 1; }
        .point-strip { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .profile-section { align-items: flex-start; flex-direction: column; }
        .footer-actions .button { flex: 1 1 135px; }
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
