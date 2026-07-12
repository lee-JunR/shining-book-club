const LEVELS = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const OPERATIONS = ["find", "aggregate", "countDocuments"];
const BLOCKED_OPERATIONS = [
  "insert",
  "update",
  "updatemany",
  "delete",
  "deletemany",
  "drop",
  "createindex",
  "dropindex",
  "compact",
  "repairdatabase",
];
const FABS = ["PTA6", "PNT6", "DWT", "PWT"];
const STORAGE_KEYS = {
  savedQueries: "smartAtlas.savedQueries",
  recentQueries: "smartAtlas.recentQueries",
  auditLogs: "smartAtlas.auditLogs",
  autoRefresh: "smartAtlas.autoRefresh",
  userPrefs: "smartAtlas.userPrefs",
};

const USER = {
  id: "ops.atlas",
  name: "Operator",
  role: "Operator",
  permittedFabs: ["PTA6", "PNT6", "DWT", "PWT"],
};

const FAB_CONFIG = {
  PTA6: {
    title: "PTA6",
    mongo: "Connected",
    collector: "Running",
    grafanaOk: true,
    cpu: 46,
    disk: 72,
    tps: 1240,
    growth: 1.8,
    lastLogSeconds: 8,
    lagSeconds: 8,
    severity: "ok",
    dashboardPath: "pta6-overview",
  },
  PNT6: {
    title: "PNT6",
    mongo: "Connected",
    collector: "Running",
    grafanaOk: true,
    cpu: 58,
    disk: 84,
    tps: 980,
    growth: 2.3,
    lastLogSeconds: 31,
    lagSeconds: 31,
    severity: "warn",
    dashboardPath: "pnt6-overview",
  },
  DWT: {
    title: "DWT",
    mongo: "Disconnected",
    collector: "Error",
    grafanaOk: false,
    cpu: 67,
    disk: 91,
    tps: 0,
    growth: 0.7,
    lastLogSeconds: 420,
    lagSeconds: 420,
    severity: "danger",
    dashboardPath: "dwt-overview",
  },
  PWT: {
    title: "PWT",
    mongo: "Unknown",
    collector: "Stopped",
    grafanaOk: true,
    cpu: 39,
    disk: 63,
    tps: 620,
    growth: 1.1,
    lastLogSeconds: 95,
    lagSeconds: 95,
    severity: "unknown",
    dashboardPath: "pwt-overview",
  },
};

const TEMPLATES = [
  {
    id: "recent-error",
    label: "최근 15분 ERROR 로그",
    description: "최근 15분 내 ERROR 로그 조회",
    query: {
      operation: "find",
      collection: "logs",
      filter: { level: { $in: ["ERROR"] } },
      sort: { timestamp: -1 },
      limit: 100,
    },
  },
  {
    id: "warn-plus",
    label: "최근 1시간 WARN 이상 로그",
    description: "최근 1시간 내 WARN, ERROR 로그 조회",
    query: {
      operation: "find",
      collection: "logs",
      filter: { level: { $in: ["WARN", "ERROR"] } },
      sort: { timestamp: -1 },
      limit: 100,
    },
  },
  {
    id: "equipment",
    label: "특정 설비 ID 조회",
    description: "설비 ID 기준 로그 조회",
    query: {
      operation: "find",
      collection: "logs",
      filter: { equipmentId: "EQ-1024" },
      sort: { timestamp: -1 },
      limit: 100,
    },
  },
  {
    id: "lot",
    label: "특정 Lot ID 조회",
    description: "Lot ID 기준 로그 조회",
    query: {
      operation: "find",
      collection: "logs",
      filter: { lotId: "LOT-24018" },
      sort: { timestamp: -1 },
      limit: 100,
    },
  },
  {
    id: "message-search",
    label: "메시지 키워드 검색",
    description: "message 필드 기준 키워드 검색",
    query: {
      operation: "find",
      collection: "logs",
      filter: { message: { $regex: "timeout", $options: "i" } },
      sort: { timestamp: -1 },
      limit: 100,
    },
  },
];

const dom = {
  fabTabs: document.getElementById("fab-tabs"),
  summaryGrid: document.getElementById("summary-grid"),
  currentFabLabel: document.getElementById("current-fab-label"),
  mongoStatusLabel: document.getElementById("mongo-status-label"),
  collectorStatusLabel: document.getElementById("collector-status-label"),
  userLabel: document.getElementById("user-label"),
  clockLabel: document.getElementById("clock-label"),
  refreshNote: document.getElementById("refresh-note"),
  serviceBadge: document.getElementById("service-badge"),
  refreshInterval: document.getElementById("refresh-interval"),
  manualRefresh: document.getElementById("manual-refresh"),
  timeSummary: document.getElementById("time-summary"),
  customTimeBox: document.getElementById("custom-time-box"),
  customStart: document.getElementById("custom-start"),
  customEnd: document.getElementById("custom-end"),
  levelFilterGroup: document.getElementById("level-filter-group"),
  templateList: document.getElementById("template-list"),
  queryEditor: document.getElementById("query-editor"),
  queryHint: document.getElementById("query-hint"),
  queryMessage: document.getElementById("query-message"),
  runQuery: document.getElementById("run-query"),
  cancelQuery: document.getElementById("cancel-query"),
  explainQuery: document.getElementById("explain-query"),
  formatJson: document.getElementById("format-json"),
  downloadCsv: document.getElementById("download-csv"),
  saveQuery: document.getElementById("save-query"),
  savedQueryName: document.getElementById("saved-query-name"),
  savedQueryList: document.getElementById("saved-query-list"),
  recentQueryList: document.getElementById("recent-query-list"),
  auditLogList: document.getElementById("audit-log-list"),
  resultTable: document.getElementById("result-table"),
  emptyState: document.getElementById("empty-state"),
  resultSummary: document.getElementById("result-summary"),
  queryLatency: document.getElementById("query-latency"),
  pageIndicator: document.getElementById("page-indicator"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  collectorReason: document.getElementById("collector-reason"),
  refreshCollector: document.getElementById("refresh-collector"),
  collectorStateText: document.getElementById("collector-state-text"),
  collectorIndicator: document.getElementById("collector-indicator"),
  cpuValue: document.getElementById("cpu-value"),
  cpuTrend: document.getElementById("cpu-trend"),
  cpuBar: document.getElementById("cpu-bar"),
  diskValue: document.getElementById("disk-value"),
  diskTrend: document.getElementById("disk-trend"),
  diskBar: document.getElementById("disk-bar"),
  tpsValue: document.getElementById("tps-value"),
  tpsTrend: document.getElementById("tps-trend"),
  tpsBar: document.getElementById("tps-bar"),
  growthValue: document.getElementById("growth-value"),
  growthTrend: document.getElementById("growth-trend"),
  growthBar: document.getElementById("growth-bar"),
  grafanaTitle: document.getElementById("grafana-title"),
  grafanaStatus: document.getElementById("grafana-status"),
  grafanaFrame: document.getElementById("grafana-frame"),
  grafanaFrameWrap: document.getElementById("grafana-frame-wrap"),
  grafanaFallback: document.getElementById("grafana-fallback"),
  grafanaRetry: document.getElementById("grafana-retry"),
  grafanaDirectLink: document.getElementById("grafana-direct-link"),
  grafanaDetailLink: document.getElementById("grafana-detail-link"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmFab: document.getElementById("confirm-fab"),
  confirmCurrentState: document.getElementById("confirm-current-state"),
  confirmAction: document.getElementById("confirm-action"),
  confirmImpact: document.getElementById("confirm-impact"),
  confirmReason: document.getElementById("confirm-reason"),
  cancelConfirm: document.getElementById("cancel-confirm"),
  submitConfirm: document.getElementById("submit-confirm"),
  jsonModal: document.getElementById("json-modal"),
  jsonView: document.getElementById("json-view"),
  jsonSubtitle: document.getElementById("json-modal-subtitle"),
  closeJson: document.getElementById("close-json"),
  copyJson: document.getElementById("copy-json"),
  toastRegion: document.getElementById("toast-region"),
  explainGrade: document.getElementById("explain-grade"),
  explainOutput: document.getElementById("explain-output"),
  collectorButtons: [...document.querySelectorAll("[data-collector-action]")],
  rangeButtons: [...document.querySelectorAll("[data-range]")],
};

const STORAGE = {
  savedQueries: readJSON(STORAGE_KEYS.savedQueries, []),
  recentQueries: readJSON(STORAGE_KEYS.recentQueries, []),
  auditLogs: readJSON(STORAGE_KEYS.auditLogs, []),
  autoRefresh: Number(localStorage.getItem(STORAGE_KEYS.autoRefresh) || 30),
};

const state = {
  fabId: "PTA6",
  timePreset: "15m",
  timeRange: resolveTimeRange("15m"),
  levelFilters: new Set(["ERROR", "WARN", "INFO"]),
  queryText: "",
  results: [],
  filteredResults: [],
  page: 1,
  pageSize: 15,
  running: false,
  activeTimeout: null,
  activeRunToken: null,
  latestExplain: null,
  selectedRow: null,
  collector: {
    status: FAB_CONFIG.PTA6.collector,
    lastAction: "Status Sync",
    lastActionAt: new Date(),
  },
  loadingGrafanaFailure: false,
  pendingCollectorAction: null,
  pendingCollectorFab: null,
  lastRefreshAt: new Date(),
  lastQueryLatencyMs: null,
};

const queryTemplatesById = new Map(TEMPLATES.map((template) => [template.id, template]));
const savedQueryMap = new Map();
for (const item of STORAGE.savedQueries) {
  if (item?.id) {
    savedQueryMap.set(item.id, item);
  }
}

const seededBase = {
  PTA6: 1700000000000,
  PNT6: 1700003000000,
  DWT: 1700006000000,
  PWT: 1700009000000,
};
const DATASET = buildDataset();

init();

function init() {
  dom.userLabel.textContent = `${USER.role} / ${USER.id}`;
  dom.refreshInterval.value = String(STORAGE.autoRefresh || 30);
  state.collector.status = FAB_CONFIG[state.fabId].collector;
  state.queryText = defaultQueryForFab(state.fabId);
  dom.queryEditor.value = state.queryText;
  dom.queryEditor.setAttribute("aria-label", "MongoDB query editor");
  dom.queryHint.textContent =
    "쿼리 DSL 예시: { \"operation\": \"find\", \"collection\": \"logs\", \"filter\": { \"level\": { \"$in\": [\"ERROR\"] } }, \"limit\": 100 }";
  renderFabTabs();
  renderTimeControls();
  renderTemplates();
  renderLevelFilters();
  renderSavedQueries();
  renderRecentQueries();
  renderAuditLogs();
  applyFab(state.fabId, { silent: true });
  attachEvents();
  syncClock();
  refreshAutoTimer();
  setInterval(syncClock, 1000);
}

function attachEvents() {
  dom.manualRefresh.addEventListener("click", () => refreshAll({ manual: true }));
  dom.refreshInterval.addEventListener("change", () => {
    STORAGE.autoRefresh = Number(dom.refreshInterval.value);
    localStorage.setItem(STORAGE_KEYS.autoRefresh, String(STORAGE.autoRefresh));
    refreshAutoTimer();
    showToast("자동 갱신 변경", `자동 갱신 주기를 ${STORAGE.autoRefresh}초로 설정했습니다.`, "info");
  });
  dom.customStart.addEventListener("change", () => {
    if (state.timePreset !== "custom") return;
    state.timeRange = resolveTimeRange("custom", dom.customStart.value, dom.customEnd.value);
    renderTimeControls();
    renderGrafana();
    refreshResultsFromCurrentQuery({ keepPage: false });
  });
  dom.customEnd.addEventListener("change", () => {
    if (state.timePreset !== "custom") return;
    state.timeRange = resolveTimeRange("custom", dom.customStart.value, dom.customEnd.value);
    renderTimeControls();
    renderGrafana();
    refreshResultsFromCurrentQuery({ keepPage: false });
  });

  dom.rangeButtons.forEach((button) => {
    button.addEventListener("click", () => setTimePreset(button.dataset.range));
  });

  dom.levelFilterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    const level = button.dataset.level;
    if (state.levelFilters.has(level)) {
      state.levelFilters.delete(level);
    } else {
      state.levelFilters.add(level);
    }
    if (state.levelFilters.size === 0) {
      state.levelFilters.add("ERROR");
    }
    renderLevelFilters();
    showToast("레벨 필터", `현재 선택: ${[...state.levelFilters].join(", ")}`, "info");
  });

  dom.templateList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-template-id]");
    if (!button) return;
    const template = queryTemplatesById.get(button.dataset.templateId);
    if (!template) return;
    dom.queryEditor.value = JSON.stringify(template.query, null, 2);
    state.queryText = dom.queryEditor.value;
    setQueryMessage(`${template.label} 템플릿을 불러왔습니다.`, "info");
  });

  dom.queryEditor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runQuery();
    }
  });

  dom.queryEditor.addEventListener("input", () => {
    state.queryText = dom.queryEditor.value;
  });

  dom.formatJson.addEventListener("click", formatEditorJson);
  dom.runQuery.addEventListener("click", runQuery);
  dom.cancelQuery.addEventListener("click", cancelRun);
  dom.explainQuery.addEventListener("click", explainQuery);
  dom.downloadCsv.addEventListener("click", downloadCsv);
  dom.saveQuery.addEventListener("click", saveCurrentQuery);
  dom.refreshCollector.addEventListener("click", () => {
    syncCollectorState();
    logAudit("collector", {
      action: "Refresh",
      fabId: state.fabId,
      outcome: "success",
    });
    showToast("수집기 상태", "현재 상태를 다시 조회했습니다.", "success");
  });

  dom.collectorButtons.forEach((button) => {
    button.addEventListener("click", () => openCollectorConfirm(button.dataset.collectorAction));
  });

  dom.prevPage.addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      renderTable();
    }
  });
  dom.nextPage.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(state.filteredResults.length / state.pageSize));
    if (state.page < totalPages) {
      state.page += 1;
      renderTable();
    }
  });

  dom.grafanaRetry.addEventListener("click", () => renderGrafana());
  dom.grafanaFrameWrap.addEventListener("click", () => openGrafanaDetail());
  dom.grafanaDetailLink.addEventListener("click", (event) => {
    event.preventDefault();
    openGrafanaDetail();
  });

  dom.cancelConfirm.addEventListener("click", closeCollectorConfirm);
  dom.submitConfirm.addEventListener("click", submitCollectorAction);

  dom.confirmModal.querySelector(".modal__backdrop").addEventListener("click", closeCollectorConfirm);
  dom.jsonModal.querySelector(".modal__backdrop").addEventListener("click", closeJsonModal);
  dom.closeJson.addEventListener("click", closeJsonModal);
  dom.copyJson.addEventListener("click", copySelectedJson);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCollectorConfirm();
      closeJsonModal();
    }
  });

  document.getElementById("saved-query-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-saved-query-id]");
    if (!button) return;
    const entry = STORAGE.savedQueries.find((item) => item.id === button.dataset.savedQueryId);
    if (!entry) return;
    dom.queryEditor.value = entry.queryText;
    state.queryText = entry.queryText;
    showToast("저장된 쿼리", `불러오기: ${entry.name}`, "info");
  });

  document.getElementById("recent-query-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-recent-query-index]");
    if (!button) return;
    const index = Number(button.dataset.recentQueryIndex);
    const entry = STORAGE.recentQueries[index];
    if (!entry) return;
    dom.queryEditor.value = entry.queryText;
    state.queryText = entry.queryText;
    showToast("최근 쿼리", "최근 실행 쿼리를 불러왔습니다.", "info");
  });

  dom.fabTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-fab-id]");
    if (!button) return;
    applyFab(button.dataset.fabId);
  });
}

function renderFabTabs() {
  const accessibleFabs = FABS.filter((fabId) => USER.permittedFabs.includes(fabId));
  dom.fabTabs.innerHTML = accessibleFabs
    .map((fabId) => {
      const config = FAB_CONFIG[fabId];
      const severity = resolveSeverity(config).service;
      const dotClass = severity === "ok" ? "is-ok" : severity === "danger" ? "is-danger" : severity === "warn" ? "is-warn" : "";
      return `
        <button class="atlas-tab ${fabId === state.fabId ? "is-active" : ""}" data-fab-id="${fabId}">
          <span class="inline-flex items-center gap-2">
            <span class="status-dot ${dotClass}"></span>
            ${fabId}
          </span>
          <span class="text-gray-400">x</span>
        </button>
      `;
    })
    .join("");
}

function renderTimeControls() {
  dom.rangeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.range === state.timePreset);
  });
  dom.timeSummary.textContent = summarizeTimeRange(state.timeRange);
  dom.customTimeBox.classList.toggle("hidden", state.timePreset !== "custom");
  if (state.timePreset === "custom") {
    dom.customStart.value = state.timeRange.startLocal || "";
    dom.customEnd.value = state.timeRange.endLocal || "";
  }
}

function renderTemplates() {
  dom.templateList.innerHTML = TEMPLATES.map((template) => {
    const query = escapeHtml(JSON.stringify(template.query, null, 2));
    return `
      <button class="template-item" data-template-id="${template.id}">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-gray-800">${template.label}</p>
            <p class="mt-1 text-xs text-gray-500">${template.description}</p>
          </div>
          <span class="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">Preset</span>
        </div>
        <pre class="mt-2 max-h-20 overflow-auto rounded bg-gray-50 p-2 text-[11px] leading-5 text-gray-500">${query}</pre>
      </button>
    `;
  }).join("");
}

function renderLevelFilters() {
  dom.levelFilterGroup.innerHTML = LEVELS.map((level) => {
    const active = state.levelFilters.has(level);
    const className = active ? "level-chip is-active" : "level-chip";
    return `<button class="${className}" data-level="${level}"><span class="level-check"></span>${level}</button>`;
  }).join("");
}

function renderSummary() {
  const config = FAB_CONFIG[state.fabId];
  const severity = resolveSeverity(config);
  dom.summaryGrid.innerHTML = [
    summaryCard("MongoDB 연결 상태", config.mongo, severity.mongo, "", config.mongo),
    summaryCard("수집기 상태", config.collector, severity.collector, "", config.collector),
    summaryCard("CPU 사용률", `${config.cpu}%`, severity.cpu, `일시적 변동 +${round((config.cpu % 7) * 0.8, 1)}%`),
    summaryCard("Disk 사용률", `${config.disk}%`, severity.disk, config.disk >= 90 ? "임계치 초과" : config.disk >= 80 ? "주의 구간" : "정상"),
    summaryCard("TPS", `${config.tps.toLocaleString()}/s`, severity.tps, "초당 로그 처리량"),
    summaryCard("일일 데이터 증가량", `${config.growth.toFixed(1)} GB`, severity.growth, "24시간 누적"),
    summaryCard("마지막 수집 시간", `${config.lastLogSeconds}초 전`, severity.lastLog),
    summaryCard("수집 지연 시간", `${config.lagSeconds}초`, severity.lag),
  ].join("");
}

function summaryCard(title, value, stateClass, caption = "", badgeText = healthLabel(stateClass)) {
  const cardClass = stateClass === "danger" ? "summary-card is-danger" : stateClass === "warn" ? "summary-card is-warn" : "summary-card";
  const dotClass = stateClass === "danger" ? "is-danger" : stateClass === "warn" ? "is-warn" : stateClass === "ok" ? "is-ok" : "";
  return `
    <div class="${cardClass}">
      <span class="summary-label">${title}</span>
      <div class="summary-value">
        <span class="status-dot ${dotClass}"></span>
        <span>${escapeHtml(value)}</span>
      </div>
      <div class="mt-1 flex items-center justify-between gap-2">
        <span class="summary-caption">${escapeHtml(caption)}</span>
        <span class="status-pill ${pillClass(stateClass)}">${escapeHtml(badgeText)}</span>
      </div>
    </div>
  `;
}

function renderGNB() {
  const config = FAB_CONFIG[state.fabId];
  dom.currentFabLabel.textContent = config.title;
  dom.mongoStatusLabel.textContent = config.mongo;
  dom.collectorStatusLabel.textContent = config.collector;
  dom.collectorStateText.textContent = config.collector;
  const serviceSeverity = resolveSeverity(config).service;
  dom.serviceBadge.className = `status-dot ${serviceSeverity === "ok" ? "is-ok" : serviceSeverity === "danger" ? "is-danger" : serviceSeverity === "warn" ? "is-warn" : ""}`;
  dom.mongoStatusLabel.className =
    config.mongo === "Connected" ? "text-emerald-300" : config.mongo === "Disconnected" ? "text-red-300" : "text-slate-300";
  syncCollectorIndicator();
}

function renderMetrics() {
  const config = FAB_CONFIG[state.fabId];
  setMetric(dom.cpuValue, dom.cpuBar, dom.cpuTrend, config.cpu, 100, `${config.cpu > 55 ? "+" : "+"}${round((config.cpu - 40) * 0.15, 1)}%`);
  setMetric(dom.diskValue, dom.diskBar, dom.diskTrend, config.disk, 100, `${config.disk > 80 ? "+" : "+"}${round((config.disk - 60) * 0.1, 1)}%`);
  setMetric(dom.tpsValue, dom.tpsBar, dom.tpsTrend, Math.min(config.tps, 2000), 2000, `${config.tps > 1000 ? "+" : "+"}${round(config.tps / 1000, 1)}%`);
  setMetric(dom.growthValue, dom.growthBar, dom.growthTrend, Math.min(config.growth, 5), 5, `+${round(config.growth * 2.6, 1)}%`);
}

function renderGrafana() {
  const config = FAB_CONFIG[state.fabId];
  const detailUrl = `https://grafana.example.local/d/${config.dashboardPath}?var-fab=${encodeURIComponent(state.fabId)}&from=${encodeURIComponent(timeRangeFrom(state.timeRange))}&to=${encodeURIComponent(timeRangeTo(state.timeRange))}`;
  dom.grafanaDirectLink.href = detailUrl;
  dom.grafanaDetailLink.href = detailUrl;
  dom.grafanaTitle.textContent = `${state.fabId} / Overview`;

  if (!config.grafanaOk || state.loadingGrafanaFailure) {
    dom.grafanaFrameWrap.classList.add("hidden");
    dom.grafanaFallback.classList.remove("hidden");
    dom.grafanaStatus.className = "status-pill status-pill--danger";
    dom.grafanaStatus.textContent = "Error";
    return;
  }

  dom.grafanaFrameWrap.classList.remove("hidden");
  dom.grafanaFallback.classList.add("hidden");
  dom.grafanaStatus.className = "status-pill status-pill--ok";
  dom.grafanaStatus.textContent = "Loaded";

  const rangeText = summarizeTimeRange(state.timeRange);
  const trend = buildTrendSeries(state.fabId);
  dom.grafanaFrame.srcdoc = buildGrafanaSrcDoc({
    fabId: state.fabId,
    rangeText,
    trend,
    config,
  });
}

function buildGrafanaSrcDoc({ fabId, rangeText, trend, config }) {
  const points = trend.map((value, index) => `${index * 12},${140 - value * 1.1}`).join(" ");
  const barWidths = [config.cpu, config.disk, Math.min(config.tps / 20, 100), Math.min(config.growth * 20, 100)];
  const spark = trend
    .map((value, index) => `<rect x="${index * 12}" y="${150 - value}" width="8" height="${value}" rx="2" fill="rgba(88,198,255,0.78)"></rect>`)
    .join("");
  return `<!DOCTYPE html>
  <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <style>
        html, body { margin: 0; background: #050b14; color: #e7f0fb; font-family: Inter, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        body { padding: 14px; }
        .top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; }
        .brand { font-weight:800; letter-spacing:0.04em; font-size:18px; }
        .sub { color:#9fb2c7; font-size:12px; margin-top:4px; }
        .pill { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:6px 10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); font-size:11px; text-transform:uppercase; letter-spacing:0.14em; }
        .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .panel { border:1px solid rgba(255,255,255,0.1); border-radius:16px; background:linear-gradient(180deg, rgba(15,23,42,0.85), rgba(3,7,18,0.9)); padding:12px; min-height:126px; }
        .panel-title { font-size:11px; color:#90a6bf; text-transform:uppercase; letter-spacing:0.18em; }
        .panel-value { font-size:28px; font-weight:800; margin-top:10px; }
        .bar { height:10px; border-radius:999px; background:rgba(148,163,184,0.16); overflow:hidden; margin-top:16px; }
        .bar > span { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg, rgba(88,198,255,0.98), rgba(45,212,191,0.82)); }
        .chart-row { margin-top:12px; display:grid; grid-template-columns:1.2fr 0.8fr; gap:12px; }
        .chart { border:1px solid rgba(255,255,255,0.1); border-radius:16px; background:#08101d; padding:12px; }
        .chart svg { width:100%; height:auto; display:block; }
        .legend { margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; font-size:12px; color:#9fb2c7; }
        .dot { width:10px; height:10px; border-radius:999px; display:inline-block; margin-right:6px; }
        .muted { color:#8ea3bb; }
      </style>
    </head>
    <body>
      <div class="top">
        <div>
          <div class="brand">${escapeHtml(fabId)} Grafana Overview</div>
          <div class="sub">${escapeHtml(rangeText)} · MongoDB / Collector / TPS / Growth</div>
        </div>
        <div class="pill">Embedded iframe preview</div>
      </div>
      <div class="grid">
        <div class="panel">
          <div class="panel-title">CPU</div>
          <div class="panel-value">${config.cpu}%</div>
          <div class="bar"><span style="width:${config.cpu}%"></span></div>
        </div>
        <div class="panel">
          <div class="panel-title">Disk</div>
          <div class="panel-value">${config.disk}%</div>
          <div class="bar"><span style="width:${config.disk}%"></span></div>
        </div>
        <div class="panel">
          <div class="panel-title">TPS</div>
          <div class="panel-value">${config.tps.toLocaleString()}/s</div>
          <div class="bar"><span style="width:${Math.min(config.tps / 20, 100)}%"></span></div>
        </div>
        <div class="panel">
          <div class="panel-title">Growth</div>
          <div class="panel-value">${config.growth.toFixed(1)} GB</div>
          <div class="bar"><span style="width:${Math.min(config.growth * 20, 100)}%"></span></div>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart">
          <div class="panel-title">Disk Trend</div>
          <svg viewBox="0 0 240 160" aria-hidden="true">
            <defs>
              <linearGradient id="line" x1="0" x2="1">
                <stop offset="0%" stop-color="#58c6ff"/>
                <stop offset="100%" stop-color="#2dd4bf"/>
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="rgba(88,198,255,0.35)" stroke-width="10" points="${points}"></polyline>
            <polyline fill="none" stroke="url(#line)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>
            ${spark}
          </svg>
        </div>
        <div class="chart">
          <div class="panel-title">Key Signals</div>
          <div class="legend"><span class="dot" style="background:#2dd4bf"></span> Connected</div>
          <div class="legend"><span class="dot" style="background:#fbbf24"></span> Warning Threshold</div>
          <div class="legend"><span class="dot" style="background:#fb7185"></span> Critical Threshold</div>
          <p class="muted" style="margin-top:12px; line-height:1.7">
            fab=${escapeHtml(fabId)} / range=${escapeHtml(rangeText)} / panels=CPU, Disk, TPS, Growth
          </p>
          <p class="muted" style="margin-top:10px; line-height:1.7">
            주요 패널 클릭 동작은 프로토타입에서 상세 Grafana 화면으로 전환되는 형태로 시뮬레이션됩니다.
          </p>
        </div>
      </div>
    </body>
  </html>`;
}

function renderQueryEditorDefaults() {
  dom.queryEditor.value = state.queryText;
}

function applyFab(fabId, options = {}) {
  state.fabId = fabId;
  state.timeRange = resolveTimeRange(state.timePreset, dom.customStart.value, dom.customEnd.value);
  state.collector.status = FAB_CONFIG[fabId].collector;
  state.queryText = defaultQueryForFab(fabId);
  renderFabTabs();
  renderTimeControls();
  renderGNB();
  renderSummary();
  renderMetrics();
  renderGrafana();
  renderExplain(defaultExplain(FAB_CONFIG[fabId]));
  if (!options.silent) {
    dom.queryEditor.value = state.queryText;
    state.queryText = dom.queryEditor.value;
    setQueryMessage(`${fabId} 기준 화면으로 변경했습니다.`, "info");
    refreshResultsFromCurrentQuery({ keepPage: false, forcedFabSwitch: true });
  } else {
    renderQueryEditorDefaults();
    refreshResultsFromCurrentQuery({ keepPage: false, forcedFabSwitch: true });
  }
  dom.savedQueryName.value = "";
  syncHeaderTime();
  if (!options.silent) {
    showToast("Fab 변경", `${fabId} 화면으로 전환했습니다.`, "success");
  }
}

function setTimePreset(preset) {
  state.timePreset = preset;
  state.timeRange = resolveTimeRange(preset, dom.customStart.value, dom.customEnd.value);
  renderTimeControls();
  renderGrafana();
  renderExplain(state.latestExplain || defaultExplain(FAB_CONFIG[state.fabId]));
  refreshResultsFromCurrentQuery({ keepPage: false });
}

function resolveTimeRange(preset, customStart = "", customEnd = "") {
  const now = new Date();
  let start;
  let end = now;

  if (preset === "custom") {
    start = customStart ? new Date(customStart) : new Date(now.getTime() - 15 * 60 * 1000);
    end = customEnd ? new Date(customEnd) : now;
  } else if (preset === "1h") {
    start = new Date(now.getTime() - 60 * 60 * 1000);
  } else if (preset === "today") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(now.getTime() - 15 * 60 * 1000);
  }

  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    start = new Date(now.getTime() - 15 * 60 * 1000);
  }
  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    end = now;
  }
  if (end < start) {
    const temp = start;
    start = end;
    end = temp;
  }

  return {
    preset,
    start,
    end,
    startLocal: toDatetimeLocal(start),
    endLocal: toDatetimeLocal(end),
  };
}

function summarizeTimeRange(range) {
  if (range.preset === "custom") {
    return `${formatDateTime(range.start)} ~ ${formatDateTime(range.end)}`;
  }
  if (range.preset === "1h") return "최근 1시간";
  if (range.preset === "today") return "오늘 00:00 ~ 현재";
  return "최근 15분";
}

function renderSavedQueries() {
  if (STORAGE.savedQueries.length === 0) {
    dom.savedQueryList.innerHTML =
      '<div class="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">저장된 쿼리가 없습니다.</div>';
    return;
  }
  dom.savedQueryList.innerHTML = STORAGE.savedQueries.map((entry) => {
    return `
      <button class="query-list-item" data-saved-query-id="${entry.id}">
        <div class="flex items-center justify-between gap-3">
          <strong class="text-sm text-gray-800">${escapeHtml(entry.name)}</strong>
          <span class="text-[11px] text-gray-500">${escapeHtml(entry.fabId)}</span>
        </div>
        <p class="mt-1 line-clamp-2 text-xs text-gray-500">${escapeHtml(shorten(entry.queryText, 120))}</p>
      </button>
    `;
  }).join("");
}

function renderRecentQueries() {
  if (STORAGE.recentQueries.length === 0) {
    dom.recentQueryList.innerHTML =
      '<div class="rounded border border-dashed border-gray-300 bg-white p-3 text-sm text-gray-500">최근 실행 쿼리가 없습니다.</div>';
    return;
  }
  dom.recentQueryList.innerHTML = STORAGE.recentQueries.slice(0, 6).map((entry, index) => {
    return `
      <button class="query-list-item" data-recent-query-index="${index}">
        <div class="flex items-center justify-between gap-3">
          <strong class="text-sm text-gray-800">${escapeHtml(entry.operation || "find")}</strong>
          <span class="text-[11px] text-gray-500">${escapeHtml(entry.timeLabel)}</span>
        </div>
        <p class="mt-1 line-clamp-2 text-xs text-gray-500">${escapeHtml(shorten(entry.queryText, 120))}</p>
      </button>
    `;
  }).join("");
}

function renderAuditLogs() {
  const items = STORAGE.auditLogs.slice(0, 5);
  if (items.length === 0) {
    dom.auditLogList.innerHTML =
      '<div class="rounded border border-dashed border-gray-300 bg-white p-3 text-sm text-gray-500">아직 감사 로그가 없습니다.</div>';
    return;
  }
  dom.auditLogList.innerHTML = items.map((entry) => {
    const badgeClass =
      entry.outcome === "success" ? "status-pill--ok" : entry.outcome === "warning" ? "status-pill--warn" : "status-pill--danger";
    return `
      <div class="audit-item text-sm">
        <div class="flex items-center justify-between gap-3">
          <strong class="text-gray-800">${escapeHtml(entry.type)}</strong>
          <span class="status-pill ${badgeClass}">${escapeHtml(entry.outcome)}</span>
        </div>
        <p class="mt-1 text-xs text-gray-500">${escapeHtml(entry.summary)}</p>
      </div>
    `;
  }).join("");
}

function refreshAll({ manual = false } = {}) {
  syncHeaderTime();
  renderGNB();
  renderSummary();
  renderMetrics();
  renderGrafana();
  renderTable();
  renderSavedQueries();
  renderRecentQueries();
  renderAuditLogs();
  if (manual) {
    showToast("새로고침", "대시보드 상태를 갱신했습니다.", "success");
  }
}

function syncHeaderTime() {
  const now = new Date();
  dom.clockLabel.textContent = now.toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dom.refreshNote.textContent = `마지막 갱신: ${now.toLocaleString("ko-KR")}`;
  state.lastRefreshAt = now;
}

function syncClock() {
  dom.clockLabel.textContent = new Date().toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function refreshAutoTimer() {
  if (state.activeAutoRefresh) {
    clearInterval(state.activeAutoRefresh);
  }
  state.activeAutoRefresh = setInterval(() => refreshAll(), STORAGE.autoRefresh * 1000);
}

function formatEditorJson() {
  const parsed = parseQuery(dom.queryEditor.value);
  if (!parsed.ok) {
    setQueryMessage(parsed.error, "error");
    showToast("JSON 포맷 실패", parsed.error, "error");
    return;
  }
  dom.queryEditor.value = JSON.stringify(parsed.value, null, 2);
  state.queryText = dom.queryEditor.value;
  setQueryMessage("JSON 포맷을 적용했습니다.", "success");
}

function runQuery() {
  if (state.running) return;
  state.timeRange = resolveTimeRange(state.timePreset, dom.customStart.value, dom.customEnd.value);
  const parsed = parseQuery(dom.queryEditor.value);
  if (!parsed.ok) {
    setQueryMessage(parsed.error, "error");
    showToast("쿼리 실행 실패", parsed.error, "error");
    return;
  }

  const validation = validateQuery(parsed.value);
  if (!validation.ok) {
    setQueryMessage(validation.message, validation.level);
    showToast("쿼리 차단", validation.message, "error");
    logAudit("query", {
      action: "Execute",
      fabId: state.fabId,
      outcome: "failure",
      queryText: dom.queryEditor.value,
      summary: validation.message,
    });
    renderAuditLogs();
    return;
  }

  state.running = true;
  state.activeRunToken = Symbol("query-run");
  dom.runQuery.disabled = true;
  dom.cancelQuery.disabled = false;
  setQueryMessage("쿼리를 실행 중입니다. 최대 실행 시간 제한이 적용됩니다.", "info");
  const started = performance.now();
  const runToken = state.activeRunToken;

  clearTimeout(state.activeTimeout);
  state.activeTimeout = setTimeout(() => {
    if (runToken !== state.activeRunToken) return;
    const results = executeQuery(parsed.value);
    state.results = results;
    state.filteredResults = results;
    state.page = 1;
    state.lastQueryLatencyMs = Math.round(performance.now() - started);
    renderTable();
    renderExplain(explainQueryShape(parsed.value));
    setQueryMessage(
      `조회 완료: ${results.length}건 / 제한 ${validation.limit}건 / ${state.lastQueryLatencyMs}ms`,
      results.length === 0 ? "warning" : "success",
    );
    const auditSummary = `Fab ${state.fabId} · ${results.length}건 · ${validation.limit}건 제한`;
    logAudit("query", {
      action: "Execute",
      fabId: state.fabId,
      outcome: "success",
      queryText: dom.queryEditor.value,
      summary: auditSummary,
      resultCount: results.length,
      latency: state.lastQueryLatencyMs,
    });
    pushRecentQuery(parsed.value, validation.limit);
    renderRecentQueries();
    renderAuditLogs();
    state.running = false;
    dom.runQuery.disabled = false;
    dom.cancelQuery.disabled = true;
    state.activeTimeout = null;
  }, 900);
}

function cancelRun() {
  if (!state.running && !state.activeTimeout) {
    showToast("취소", "실행 중인 쿼리가 없습니다.", "info");
    return;
  }
  clearTimeout(state.activeTimeout);
  state.activeTimeout = null;
  state.activeRunToken = null;
  state.running = false;
  dom.runQuery.disabled = false;
  dom.cancelQuery.disabled = true;
  setQueryMessage("쿼리 실행을 취소했습니다.", "warning");
  showToast("쿼리 취소", "실행을 중단했습니다.", "warning");
  logAudit("query", {
    action: "Cancel",
    fabId: state.fabId,
    outcome: "warning",
    summary: "사용자 취소",
  });
  renderAuditLogs();
}

function explainQuery() {
  const parsed = parseQuery(dom.queryEditor.value);
  if (!parsed.ok) {
    setQueryMessage(parsed.error, "error");
    renderExplain({
      grade: "danger",
      title: "문법 오류",
      bullets: [parsed.error],
    });
    return;
  }
  const result = explainQueryShape(parsed.value);
  renderExplain(result);
  setQueryMessage(result.bullets.join(" · "), result.grade === "danger" ? "error" : result.grade === "warn" ? "warning" : "success");
}

function explainQueryShape(query) {
  const warnings = [];
  const indexFields = [];
  const filter = query.filter || {};
  if (filter.timestamp) indexFields.push("timestamp");
  if (filter.level) indexFields.push("level");
  if (filter.equipmentId) indexFields.push("equipmentId");
  if (filter.lotId) indexFields.push("lotId");
  if (filter.fab) indexFields.push("fab");
  if (typeof filter.message === "object" && filter.message.$regex) warnings.push("message 정규식은 풀스캔 위험이 있습니다.");
  if (!filter.timestamp) warnings.push("시간 조건이 없습니다. 기본 시간 필터가 적용됩니다.");
  if (indexFields.length === 0) warnings.push("선택적 인덱스 조건이 없으면 전체 스캔 가능성이 높습니다.");

  const grade = warnings.some((item) => item.includes("전체 스캔") || item.includes("풀스캔")) ? "warn" : warnings.length ? "warn" : "ok";
  return {
    grade,
    title: "Explain 결과",
    bullets: [
      `operation=${query.operation}`,
      `limit=${query.limit || 100}`,
      `indexCandidates=${indexFields.length ? indexFields.join(", ") : "none"}`,
      warnings.length ? `warnings=${warnings.join(" / ")}` : "위험 패턴이 발견되지 않았습니다.",
    ],
  };
}

function validateQuery(query) {
  const operation = String(query.operation || "").trim();
  if (!OPERATIONS.includes(operation)) {
    const blocked = BLOCKED_OPERATIONS.find((item) => operation.toLowerCase() === item);
    if (blocked) {
      return {
        ok: false,
        level: "error",
        message: `차단된 명령입니다: ${operation}`,
      };
    }
    return {
      ok: false,
      level: "error",
      message: "operation은 find, aggregate, countDocuments만 허용됩니다.",
    };
  }

  const limit = normalizeLimit(query.limit);
  if (limit > 1000) {
    return {
      ok: false,
      level: "error",
      message: "limit은 최대 1000건까지만 허용됩니다.",
    };
  }

  const range = state.timePreset === "custom" ? resolveTimeRange("custom", dom.customStart.value, dom.customEnd.value) : resolveTimeRange(state.timePreset, dom.customStart.value, dom.customEnd.value);
  if (Number.isNaN(range.start.getTime()) || Number.isNaN(range.end.getTime())) {
    return {
      ok: false,
      level: "error",
      message: "시간 범위가 유효하지 않습니다.",
    };
  }

  if (query.limit == null) {
    query.limit = 100;
  }

  return {
    ok: true,
    limit,
  };
}

function executeQuery(query) {
  const fabricated = DATASET[state.fabId] || [];
  state.timeRange = resolveTimeRange(state.timePreset, dom.customStart.value, dom.customEnd.value);
  const effectiveRange = state.timeRange;
  const normalizedLevels = [...state.levelFilters];
  const filter = query.filter || {};
  const limit = normalizeLimit(query.limit);

  let rows = fabricated.filter((row) => {
    if (row.timestamp < effectiveRange.start || row.timestamp > effectiveRange.end) return false;
    if (normalizedLevels.length && !normalizedLevels.includes(row.level)) return false;
    if (filter.level && !matchesLevelFilter(row.level, filter.level)) return false;
    if (filter.fab && String(row.fab).toUpperCase() !== String(filter.fab).toUpperCase()) return false;
    if (filter.equipmentId && String(row.equipmentId) !== String(filter.equipmentId)) return false;
    if (filter.lotId && String(row.lotId) !== String(filter.lotId)) return false;
    if (filter.message && !matchesMessageFilter(row.message, filter.message)) return false;
    return true;
  });

  rows = sortRows(rows, query.sort);
  if (limit) rows = rows.slice(0, limit);
  return rows;
}

function matchesLevelFilter(level, filter) {
  if (filter.$in && Array.isArray(filter.$in)) {
    return filter.$in.includes(level);
  }
  if (typeof filter === "string") return level === filter;
  return true;
}

function matchesMessageFilter(message, filter) {
  if (typeof filter === "string") {
    return message.toLowerCase().includes(filter.toLowerCase());
  }
  if (filter.$regex) {
    try {
      const regex = new RegExp(filter.$regex, filter.$options || "");
      return regex.test(message);
    } catch {
      return false;
    }
  }
  return true;
}

function sortRows(rows, sort = { timestamp: -1 }) {
  const sortKeys = Object.entries(sort);
  if (sortKeys.length === 0) {
    return rows.slice().sort((a, b) => b.timestamp - a.timestamp);
  }
  return rows.slice().sort((a, b) => {
    for (const [field, direction] of sortKeys) {
      const directionNumber = Number(direction) >= 0 ? 1 : -1;
      if (a[field] < b[field]) return -1 * directionNumber;
      if (a[field] > b[field]) return 1 * directionNumber;
    }
    return 0;
  });
}

function renderTable() {
  const rows = state.results;
  state.filteredResults = rows;
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);

  dom.resultSummary.textContent = `${rows.length.toLocaleString()}건 조회`;
  dom.queryLatency.textContent = state.lastQueryLatencyMs == null ? "실행 시간 -" : `실행 시간 ${state.lastQueryLatencyMs}ms`;
  dom.pageIndicator.textContent = `${state.page} / ${totalPages}`;
  dom.prevPage.disabled = state.page <= 1;
  dom.nextPage.disabled = state.page >= totalPages;

  if (rows.length === 0) {
    dom.resultTable.innerHTML = "";
    dom.emptyState.classList.remove("hidden");
    return;
  }

  dom.emptyState.classList.add("hidden");
  dom.resultTable.innerHTML = pageRows
    .map((row, index) => {
      const rowIndex = start + index;
      return `
        <tr class="cursor-pointer transition hover:bg-blue-50" data-row-index="${rowIndex}">
          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">${formatDateTime(row.timestamp)}</td>
          <td class="px-4 py-3">${levelBadge(row.level)}</td>
          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${escapeHtml(row.fab)}</td>
          <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">${escapeHtml(row.equipmentId)}</td>
          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${escapeHtml(row.lotId)}</td>
          <td class="px-4 py-2 text-sm text-gray-800">
            <button class="max-w-xl truncate text-left hover:text-blue-700" data-open-row="${rowIndex}">${escapeHtml(row.message)}</button>
            ${row.stackTrace ? `<div class="mt-1 max-w-xl truncate text-xs text-gray-400">${escapeHtml(row.stackTrace)}</div>` : ""}
          </td>
          <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">${escapeHtml(row.source)}</td>
        </tr>
      `;
    })
    .join("");

  dom.resultTable.querySelectorAll("tr[data-row-index]").forEach((rowEl) => {
    rowEl.addEventListener("click", () => {
      const idx = Number(rowEl.dataset.rowIndex);
      const row = rows[idx];
      openJsonModal(row);
    });
  });
}

function levelBadge(level) {
  const className =
    level === "ERROR"
      ? "rounded border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"
      : level === "WARN"
        ? "rounded border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700"
        : level === "INFO"
          ? "rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700"
          : "rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700";
  return `<span class="${className}">${escapeHtml(level)}</span>`;
}

function openJsonModal(row) {
  state.selectedRow = row;
  dom.jsonSubtitle.textContent = `${row.fab} · ${row.level} · ${formatDateTime(row.timestamp)}`;
  dom.jsonView.textContent = JSON.stringify(row, null, 2);
  dom.jsonModal.classList.remove("hidden");
}

function closeJsonModal() {
  dom.jsonModal.classList.add("hidden");
}

async function copySelectedJson() {
  if (!state.selectedRow) return;
  const json = JSON.stringify(state.selectedRow, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    showToast("복사 완료", "JSON 원본을 클립보드에 복사했습니다.", "success");
  } catch {
    showToast("복사 실패", "브라우저가 클립보드 접근을 차단했습니다.", "error");
  }
}

function openCollectorConfirm(action) {
  state.pendingCollectorAction = action;
  state.pendingCollectorFab = state.fabId;
  const currentState = FAB_CONFIG[state.fabId].collector;
  dom.confirmFab.textContent = state.fabId;
  dom.confirmCurrentState.textContent = currentState;
  dom.confirmAction.textContent = action.toUpperCase();
  dom.confirmImpact.textContent =
    action === "start"
      ? "수집기가 즉시 수집을 시작합니다."
      : action === "stop"
        ? "수집이 중단되어 신규 로그 수집이 멈춥니다."
        : "수집기를 재시작하며 짧은 중단이 발생할 수 있습니다.";
  dom.confirmReason.value = dom.collectorReason.value || "";
  dom.confirmModal.classList.remove("hidden");
}

function closeCollectorConfirm() {
  dom.confirmModal.classList.add("hidden");
  state.pendingCollectorAction = null;
  state.pendingCollectorFab = null;
}

function submitCollectorAction() {
  if (!state.pendingCollectorAction) return;
  const action = state.pendingCollectorAction;
  const fabId = state.pendingCollectorFab;
  const reason = (dom.confirmReason.value || "").trim();
  if (action !== "start" && reason.length === 0) {
    setQueryMessage("Stop / Restart에는 사유 입력이 권장됩니다. 사유 없이 진행하지 않았습니다.", "warning");
    showToast("사유 필요", "Stop / Restart는 사유를 입력해 주세요.", "warning");
    return;
  }

  const prev = FAB_CONFIG[fabId].collector;
  const next =
    action === "start"
      ? "Running"
      : action === "stop"
        ? "Stopped"
        : "Running";
  FAB_CONFIG[fabId].collector = next;
  state.collector.status = next;
  dom.collectorReason.value = reason;
  closeCollectorConfirm();
  renderGNB();
  renderSummary();
  syncCollectorIndicator();
  showToast("수집기 작업", `${action.toUpperCase()} 작업을 반영했습니다.`, "success");
  logAudit("collector", {
    action,
    fabId,
    outcome: "success",
    summary: `${prev} -> ${next}`,
    reason,
  });
  renderAuditLogs();
}

function syncCollectorState() {
  const collector = FAB_CONFIG[state.fabId].collector;
  state.collector.status = collector;
  dom.collectorStateText.textContent = collector;
  syncCollectorIndicator();
}

function syncCollectorIndicator() {
  const collector = FAB_CONFIG[state.fabId].collector;
  dom.collectorStatusLabel.textContent = collector;
  dom.collectorStateText.textContent = collector;
  dom.collectorIndicator.className = "status-dot";
  if (collector === "Running") {
    dom.collectorIndicator.classList.add("is-ok");
    dom.collectorStatusLabel.className = "text-emerald-300";
  } else if (collector === "Stopped") {
    dom.collectorIndicator.classList.add("is-warn");
    dom.collectorStatusLabel.className = "text-amber-300";
  } else if (collector === "Error") {
    dom.collectorIndicator.classList.add("is-danger");
    dom.collectorStatusLabel.className = "text-red-300";
  } else {
    dom.collectorStatusLabel.className = "text-slate-300";
  }
}

function downloadCsv() {
  if (state.results.length === 0) {
    showToast("CSV 다운로드", "다운로드할 조회 결과가 없습니다.", "warning");
    return;
  }

  const header = ["timestamp", "level", "fab", "equipmentId", "lotId", "message", "source", "stackTrace"];
  const rows = state.results.map((row) =>
    header
      .map((field) => csvEscape(row[field] == null ? "" : row[field] instanceof Date ? row[field].toISOString() : String(row[field])))
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.fabId}-logs-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  logAudit("download", {
    action: "CSV Export",
    fabId: state.fabId,
    outcome: "success",
    summary: `${state.results.length}건 다운로드`,
  });
  renderAuditLogs();
  showToast("CSV 다운로드", `${state.results.length}건을 내려받았습니다.`, "success");
}

function saveCurrentQuery() {
  const name = (dom.savedQueryName.value || "").trim();
  if (!name) {
    showToast("저장 실패", "저장명을 입력해 주세요.", "warning");
    return;
  }
  const existing = STORAGE.savedQueries.find((entry) => entry.name === name && entry.fabId === state.fabId);
  const payload = {
    id:
      existing?.id ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `query-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name,
    fabId: state.fabId,
    queryText: dom.queryEditor.value,
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    Object.assign(existing, payload);
  } else {
    STORAGE.savedQueries.unshift(payload);
  }
  STORAGE.savedQueries.splice(30);
  persistJSON(STORAGE_KEYS.savedQueries, STORAGE.savedQueries.slice(0, 30));
  renderSavedQueries();
  dom.savedQueryName.value = "";
  showToast("저장 완료", `쿼리 "${name}"을 저장했습니다.`, "success");
}

function pushRecentQuery(query, limit) {
  const entry = {
    fabId: state.fabId,
    operation: query.operation,
    timeLabel: summarizeTimeRange(state.timeRange),
    queryText: JSON.stringify(query, null, 2),
    limit,
    at: new Date().toISOString(),
  };
  STORAGE.recentQueries.unshift(entry);
  STORAGE.recentQueries.splice(20);
  persistJSON(STORAGE_KEYS.recentQueries, STORAGE.recentQueries);
}

function logAudit(type, { action, fabId, outcome, queryText = "", summary = "", resultCount = 0, latency = null, reason = "" }) {
  const entry = {
    type: type === "collector" ? "Collector" : type === "download" ? "CSV Download" : "Query Execute",
    action,
    fabId,
    outcome,
    summary:
      summary ||
      `${action} · ${fabId} · ${outcome}` +
      (resultCount ? ` · ${resultCount}건` : "") +
      (latency ? ` · ${latency}ms` : "") +
      (reason ? ` · ${reason}` : ""),
    queryText,
    resultCount,
    latency,
    reason,
    at: new Date().toISOString(),
  };
  STORAGE.auditLogs.unshift(entry);
  STORAGE.auditLogs.splice(50);
  persistJSON(STORAGE_KEYS.auditLogs, STORAGE.auditLogs);
}

function renderExplain(result) {
  state.latestExplain = result;
  dom.explainGrade.className = `status-pill ${pillClass(result.grade)}`;
  dom.explainGrade.textContent = stateLabel(result.grade);
  dom.explainOutput.textContent = [result.title, "", ...result.bullets.map((line) => `- ${line}`)].join("\n");
}

function setQueryMessage(message, level = "info") {
  const palette =
    level === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : level === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : level === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-blue-200 bg-blue-50 text-blue-700";
  dom.queryMessage.className = `mt-2 rounded border px-3 py-2 text-sm ${palette}`;
  dom.queryMessage.textContent = message;
}

function showToast(title, message, level = "info") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="toast__title">${escapeHtml(title)}</div>
    <div class="toast__message">${escapeHtml(message)}</div>
  `;
  if (level === "error") {
    toast.style.borderColor = "rgba(251, 113, 133, 0.38)";
  } else if (level === "warning") {
    toast.style.borderColor = "rgba(251, 191, 36, 0.38)";
  } else if (level === "success") {
    toast.style.borderColor = "rgba(45, 212, 191, 0.38)";
  }
  dom.toastRegion.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
  }, 2500);
  setTimeout(() => toast.remove(), 3100);
}

function openGrafanaDetail() {
  const detailWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!detailWindow) {
    showToast("Grafana 상세", "팝업이 차단되었습니다.", "warning");
    return;
  }
  detailWindow.document.write(dom.grafanaFrame.srcdoc);
  detailWindow.document.close();
}

function defaultQueryForFab(fabId) {
  const template = {
    operation: "find",
    collection: "logs",
    filter: {
      timestamp: {
        $gte: toIso(resolveTimeRange("15m").start),
        $lte: toIso(new Date()),
      },
      fab: fabId,
      level: { $in: ["ERROR", "WARN"] },
    },
    sort: { timestamp: -1 },
    limit: 100,
  };
  return JSON.stringify(template, null, 2);
}

function parseQuery(source) {
  try {
    const parsed = JSON.parse(source);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "쿼리는 JSON 객체여야 합니다." };
    }
    return { ok: true, value: parsed };
  } catch (error) {
    return { ok: false, error: "쿼리 JSON 문법이 올바르지 않습니다." };
  }
}

function normalizeLimit(limit) {
  const value = Number(limit);
  if (!Number.isFinite(value) || value <= 0) {
    return 100;
  }
  return Math.min(Math.floor(value), 1000);
}

function buildDataset() {
  const dataset = {};
  for (const fabId of FABS) {
    dataset[fabId] = [];
    const seed = seededBase[fabId];
    const random = mulberry32(seed);
    const levels = ["ERROR", "WARN", "INFO", "INFO", "DEBUG", "TRACE"];
    const sources = ["collector", "etl", "driver", "parser", "watcher"];
    const equipmentIds = ["EQ-1024", "EQ-1041", "EQ-1088", "EQ-1122", "EQ-1180", "EQ-1207"];
    const lotIds = ["LOT-24018", "LOT-24044", "LOT-24081", "LOT-24110", "LOT-24133"];
    const messages = [
      "MongoDB write concern timeout detected",
      "Collector heartbeat received",
      "Replica set election completed",
      "Slow query detected for lot lookup",
      "Equipment temperature threshold updated",
      "Aggregation job finished successfully",
      "Network retry count increased",
      "Disk watermark warning raised",
      "Device handshake completed",
      "Index candidate evaluated for logs query",
    ];
    const baseNow = Date.now();
    const sampleCount = 420;
    for (let index = 0; index < sampleCount; index += 1) {
      const level = levels[Math.floor(random() * levels.length)];
      const offsetMinutes = Math.floor(random() * 24 * 60);
      const timestamp = new Date(baseNow - offsetMinutes * 60 * 1000 - index * 2500);
      const message = messages[Math.floor(random() * messages.length)];
      const eq = equipmentIds[Math.floor(random() * equipmentIds.length)];
      const lot = lotIds[Math.floor(random() * lotIds.length)];
      dataset[fabId].push({
        timestamp,
        level,
        fab: fabId,
        equipmentId: eq,
        lotId: lot,
        message: `${message} · ${fabId} · ${eq} · ${lot}`,
        source: sources[Math.floor(random() * sources.length)],
        stackTrace:
          level === "ERROR"
            ? `java.lang.RuntimeException: ${message}\n  at com.smartatlas.collector.${fabId.toLowerCase()}.CollectorPipeline.process(CollectorPipeline.java:118)\n  at com.smartatlas.collector.Engine.run(Engine.java:54)`
            : "",
      });
    }
  }
  return dataset;
}

function buildTrendSeries(fabId) {
  const random = mulberry32(seededBase[fabId] + 99);
  return Array.from({ length: 16 }, () => Math.max(18, Math.round(random() * 100)));
}

function setMetric(valueEl, barEl, trendEl, value, max, trendText) {
  const ratio = Math.max(0, Math.min(100, (value / max) * 100));
  valueEl.textContent = valueEl === dom.tpsValue ? `${Math.round(value).toLocaleString()}/s` : valueEl === dom.growthValue ? `${Number(value).toFixed(1)} GB` : `${Math.round(value)}%`;
  barEl.style.width = `${ratio}%`;
  trendEl.textContent = trendText;
}

function csvEscape(value) {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("ko-KR", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toDatetimeLocal(date) {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
}

function toIso(date) {
  return new Date(date).toISOString();
}

function timeRangeFrom(range) {
  return toIso(range.start);
}

function timeRangeTo(range) {
  return toIso(range.end);
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function shorten(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stateLabel(stateClass) {
  if (stateClass === "ok" || stateClass === "success") return "Connected";
  if (stateClass === "warn" || stateClass === "warning") return "Warning";
  if (stateClass === "danger" || stateClass === "error") return "Critical";
  return "Unknown";
}

function healthLabel(stateClass) {
  if (stateClass === "ok" || stateClass === "success") return "Healthy";
  if (stateClass === "warn" || stateClass === "warning") return "Warning";
  if (stateClass === "danger" || stateClass === "error") return "Critical";
  return "Unknown";
}

function pillClass(stateClass) {
  if (stateClass === "ok" || stateClass === "success") return "status-pill--ok";
  if (stateClass === "warn" || stateClass === "warning") return "status-pill--warn";
  if (stateClass === "danger" || stateClass === "error") return "status-pill--danger";
  return "status-pill--unknown";
}

function resolveSeverity(config) {
  return {
    service: config.mongo === "Connected" ? "ok" : config.mongo === "Disconnected" ? "danger" : "unknown",
    mongo: config.mongo === "Connected" ? "ok" : config.mongo === "Disconnected" ? "danger" : "unknown",
    collector:
      config.collector === "Running"
        ? "ok"
        : config.collector === "Stopped"
          ? "warn"
          : config.collector === "Error"
            ? "danger"
            : "unknown",
    cpu: config.cpu >= 85 ? "warn" : "ok",
    disk: config.disk >= 90 ? "danger" : config.disk >= 80 ? "warn" : "ok",
    tps: config.tps === 0 ? "warn" : "ok",
    growth: config.growth >= 2 ? "warn" : "ok",
    lastLog: config.lastLogSeconds > 120 ? "warn" : "ok",
    lag: config.lagSeconds > 120 ? "warn" : "ok",
  };
}

function defaultExplain(config) {
  return {
    grade: config.disk >= 90 || config.mongo === "Disconnected" ? "danger" : config.disk >= 80 ? "warn" : "ok",
    title: "초기 상태 설명",
    bullets: [
      `MongoDB=${config.mongo}`,
      `Collector=${config.collector}`,
      `Disk=${config.disk}%`,
      config.disk >= 90 ? "Disk 90% 이상으로 Critical입니다." : config.disk >= 80 ? "Disk 80% 이상으로 Warning입니다." : "핵심 리소스는 정상 구간입니다.",
    ],
  };
}

function persistJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function refreshResultsFromCurrentQuery({ keepPage = false, forcedFabSwitch = false } = {}) {
  const parsed = parseQuery(dom.queryEditor.value);
  if (!parsed.ok) {
    state.results = [];
    state.filteredResults = [];
    renderTable();
    return;
  }
  const results = executeQuery(parsed.value);
  state.results = results;
  state.filteredResults = results;
  if (!keepPage || forcedFabSwitch) state.page = 1;
  renderTable();
}
