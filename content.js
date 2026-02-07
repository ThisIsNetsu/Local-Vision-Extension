(function () {
  if (window.__vtlInit) return;
  window.__vtlInit = true;

  /* ═══════════════════════════════════════════════════════
     CSS
     ═══════════════════════════════════════════════════════ */
  const CSS = `
    .vtl-overlay {
      position:fixed;inset:0;z-index:2147483640;
      background:rgba(0,0,0,.6);
      display:flex;justify-content:center;align-items:center;
      backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
      font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
      font-size:14px;line-height:1.5;
      overscroll-behavior:contain;
    }
    .vtl-panel {
      width:120rem;max-width:98vw;height:92vh;
      background:#0d1117;color:#e6edf3;
      border-radius:16px;border:1px solid #30363d;
      box-shadow:0 24px 64px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04);
      display:flex;flex-direction:column;overflow:hidden;
    }
    .vtl-accent {
      height:3px;flex-shrink:0;
      background:linear-gradient(90deg,#e94560,#0f3460 50%,#e94560);
    }
    .vtl-header {
      display:flex;align-items:center;gap:10px;
      padding:12px 18px;background:#161b22;
      border-bottom:1px solid #30363d;flex-shrink:0;
    }
    .vtl-title {
      flex:1;font-weight:700;font-size:15px;color:#e6edf3;
      display:flex;align-items:center;gap:8px;
    }
    .vtl-title-dot {
      width:8px;height:8px;border-radius:50%;background:#e94560;
      display:inline-block;flex-shrink:0;
    }
    .vtl-badge-ctx {
      font-size:10px;font-weight:500;
      padding:3px 9px;border-radius:10px;
      background:#21262d;color:#484f58;
      margin-left:4px;white-space:nowrap;
      cursor:default;transition:all .15s;
    }
    .vtl-badge-ctx.vtl-has-ctx {
      background:rgba(88,166,255,.15);color:#58a6ff;
      cursor:pointer;
    }
    .vtl-badge-ctx.vtl-has-ctx:hover {
      background:rgba(88,166,255,.28);
    }
    .vtl-btn {
      background:transparent;color:#8b949e;
      border:1px solid #30363d;border-radius:6px;
      padding:5px 14px;font-size:12px;font-weight:500;
      cursor:pointer;transition:all .2s;white-space:nowrap;
    }
    .vtl-btn:hover { background:#e94560;color:#fff;border-color:#e94560; }
    .vtl-btn-clear:hover { background:#da3633;border-color:#da3633; }
    .vtl-select {
      background:#0d1117;color:#e6edf3;border:1px solid #30363d;
      border-radius:6px;padding:5px 10px;font-size:12px;
      cursor:pointer;
    }
    .vtl-content {
      flex:1;display:flex;overflow:hidden;
    }
    .vtl-left {
      flex:1;display:flex;flex-direction:column;min-width:0;
    }
    .vtl-right {
      width:52%;background:#010409;
      display:flex;flex-direction:column;
      border-left:1px solid #30363d;padding:16px;flex-shrink:0;
      overflow:hidden;gap:12px;min-height:0;
    }
    .vtl-image-wrap {
      flex:1 1 auto;display:flex;align-items:center;justify-content:center;
      background:#0d1117;border:1px solid #21262d;border-radius:8px;
      padding:8px;position:relative;min-height:0;
    }
    .vtl-image-wrap.vtl-image-selecting {
      cursor:crosshair;
      box-shadow:0 0 0 2px rgba(233,69,96,.35) inset;
    }
    .vtl-image-hint {
      position:absolute;top:6px;left:50%;transform:translateX(-50%);
      display:flex;align-items:center;justify-content:center;
      color:#e94560;font:600 11px system-ui;pointer-events:none;
      text-shadow:0 2px 6px rgba(0,0,0,.7);
      background:rgba(22,27,34,.75);border:1px solid #30363d;
      padding:4px 10px;border-radius:999px;
    }
    .vtl-image-sel-box {
      position:absolute;border:2px dashed #e94560;
      background:rgba(233,69,96,.12);pointer-events:none;
    }
    .vtl-image-wrap img {
      max-width:100%;max-height:100%;
      object-fit:contain;border-radius:6px;
      box-shadow:0 4px 16px rgba(0,0,0,.4);
    }
    .vtl-chat {
      flex:0 0 auto;display:flex;flex-direction:column;
      background:#0d1117;border:1px solid #21262d;border-radius:8px;
      overflow:auto;resize:vertical;min-height:170px;
    }
    .vtl-chat-hdr {
      padding:8px 12px;font-size:12px;color:#58a6ff;
      background:#161b22;border-bottom:1px solid #21262d;
      font-weight:600;
    }
    .vtl-chat-body {
      flex:1;overflow-y:auto;padding:10px 12px;
      display:flex;flex-direction:column;gap:8px;
      scrollbar-width:thin;scrollbar-color:#30363d transparent;
    }
    .vtl-msg {
      max-width:90%;padding:8px 10px;border-radius:8px;
      font-size:12.5px;line-height:1.5;white-space:pre-wrap;
      word-break:break-word;
    }
    .vtl-msg.user { align-self:flex-end;background:#1c2129;color:#e6edf3; }
    .vtl-msg.ai { align-self:flex-start;background:#161b22;color:#8b949e;border:1px solid #21262d; }
    .vtl-chat-input {
      display:flex;gap:8px;padding:8px;border-top:1px solid #21262d;
      background:#0d1117;
    }
    .vtl-chat-input textarea {
      flex:1;background:#0d1117;color:#e6edf3;border:1px solid #30363d;
      border-radius:6px;padding:6px 8px;font-size:12px;resize:none;
      height:32px;min-height:32px;max-height:32px;
    }
    .vtl-info {
      padding:8px 18px;font-size:11px;color:#484f58;
      background:#0d1117;border-bottom:1px solid #21262d;flex-shrink:0;
    }
    .vtl-info kbd {
      display:inline-block;background:#161b22;color:#8b949e;
      border:1px solid #30363d;border-radius:3px;
      padding:0 5px;font-size:10px;font-family:inherit;
      vertical-align:1px;
    }
    .vtl-body {
      flex:1;overflow-y:auto;padding:12px 18px;
      scrollbar-width:thin;scrollbar-color:#30363d transparent;
    }
    .vtl-global {
      flex-shrink:0;border-top:1px solid #21262d;background:#0d1117;
      padding:10px 18px;display:flex;flex-direction:column;gap:8px;
    }
    .vtl-global-label {
      font-size:11px;color:#58a6ff;font-weight:600;
    }
    .vtl-global textarea {
      background:#0d1117;color:#e6edf3;border:1px solid #30363d;
      border-radius:6px;padding:8px;font-size:12px;resize:vertical;
      min-height:48px;max-height:140px;
    }
    .vtl-global-actions { display:flex;gap:8px;align-items:center; }
    .vtl-global-status { font-size:11px;color:#484f58; }
    .vtl-order {
      display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;
      font-size:11px;color:#8b949e;
    }
    .vtl-order label {
      display:inline-flex;align-items:center;gap:6px;cursor:pointer;
    }
    .vtl-order input { accent-color:#e94560; }
    /* ── analysis section ── */
    .vtl-analysis {
      margin:0 0 10px;border-radius:8px;
      background:#161b22;border:1px solid #21262d;overflow:hidden;
    }
    .vtl-analysis-hdr {
      padding:9px 12px;font-size:12px;font-weight:600;color:#58a6ff;
      cursor:pointer;display:flex;align-items:center;gap:7px;
      transition:background .15s;user-select:none;
    }
    .vtl-analysis-hdr:hover { background:#1c2129; }
    .vtl-analysis-arrow {
      font-size:9px;transition:transform .2s;display:inline-block;
    }
    .vtl-analysis-arrow.open { transform:rotate(90deg); }
    .vtl-analysis-body {
      padding:10px 12px;font-size:12px;color:#8b949e;
      line-height:1.65;border-top:1px solid #21262d;
      white-space:pre-wrap;word-break:break-word;
    }
    /* ── translation blocks ── */
    .vtl-block {
      margin-bottom:10px;padding:10px 12px;
      background:#161b22;border-radius:8px;
      border-left:3px solid transparent;
      cursor:pointer;transition:all .15s;position:relative;
    }
    .vtl-block[draggable="true"] { cursor:grab; }
    .vtl-block.vtl-dragging { opacity:.6; cursor:grabbing; }
    .vtl-block.vtl-drop-before { border-top:2px solid #e94560; }
    .vtl-block.vtl-drop-after { border-bottom:2px solid #e94560; }
    .vtl-block.vtl-drop-merge { box-shadow:0 0 0 2px rgba(88,166,255,.5) inset; }
    .vtl-block:hover { border-left-color:#e94560;background:#1c2129; }
    .vtl-block.vtl-warn { border-left-color:#e9a045; }
    .vtl-merge-tag {
      position:absolute;top:8px;right:34px;font-size:10px;
      color:#58a6ff;background:rgba(88,166,255,.12);
      border:1px solid rgba(88,166,255,.35);border-radius:999px;
      padding:2px 6px;font-weight:600;text-transform:uppercase;
      letter-spacing:.3px;
    }
    .vtl-warn-tag {
      position:absolute;top:8px;right:10px;font-size:12px;color:#e9a045;
    }
    .vtl-badge {
      display:inline-block;font-size:9px;font-weight:700;
      padding:2px 6px;border-radius:4px;margin-bottom:5px;
      text-transform:uppercase;letter-spacing:.5px;
    }
    .vtl-badge-dialogue  { background:rgba(233,69,96,.15);color:#e94560 }
    .vtl-badge-narration { background:rgba(88,166,255,.15);color:#58a6ff }
    .vtl-badge-sfx       { background:rgba(233,160,69,.15);color:#e9a045 }
    .vtl-badge-sign      { background:rgba(69,233,128,.15);color:#45e980 }
    .vtl-badge-text      { background:rgba(136,69,233,.15);color:#a371f7 }
    .vtl-orig {
      font-size:11px;color:#484f58;margin-bottom:3px;
      word-break:break-word;line-height:1.4;
    }
    .vtl-trans {
      font-size:13.5px;color:#e6edf3;line-height:1.55;
      word-break:break-word;
    }
    .vtl-note {
      margin-top:6px;width:100%;
      background:#0d1117;color:#e6edf3;border:1px solid #30363d;
      border-radius:6px;padding:6px 8px;font-size:11.5px;
      resize:none;overflow:hidden;line-height:1.2;
      height:0;min-height:0;max-height:0;margin-top:0;
      padding-top:0;padding-bottom:0;border-color:transparent;
      opacity:0;pointer-events:none;
      transition:opacity .12s, max-height .12s, margin-top .12s, padding .12s, border-color .12s;
    }
    .vtl-block:hover .vtl-note,
    .vtl-note:focus {
      opacity:1;max-height:28px;height:28px;min-height:28px;margin-top:6px;
      padding-top:6px;padding-bottom:6px;border-color:#30363d;
      pointer-events:auto;
    }
    .vtl-note::placeholder { color:#484f58; }
    .vtl-status {
      text-align:center;padding:28px 12px;
      font-size:13px;color:#484f58;
    }
    .vtl-status.vtl-err { color:#e94560; }
    .vtl-raw {
      white-space:pre-wrap;word-break:break-word;
      font:12px/1.6 'Cascadia Code','Fira Code','Consolas',monospace;color:#8b949e;
    }
    .vtl-pulse::after {
      content:" ●";animation:vtlBlink 1s steps(2) infinite;color:#e94560;
    }
    @keyframes vtlBlink{50%{opacity:0}}
    /* context menu */
    .vtl-ctx {
      position:fixed;z-index:2147483647;
      background:#161b22;border:1px solid #30363d;
      border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.5);
      padding:6px 0;min-width:200px;
    }
    .vtl-ctx-item {
      padding:8px 16px;font-size:13px;color:#e6edf3;
      cursor:pointer;transition:background .12s;
    }
    .vtl-ctx-item:hover { background:#21262d; }
    .vtl-ctx-desc {
      padding:0 16px 6px;font-size:10px;color:#484f58;
      margin-top:-4px;
    }
    .vtl-ctx-sep { height:1px;background:#21262d;margin:4px 0; }
    /* region selector */
    .vtl-sel {
      position:fixed;inset:0;z-index:2147483643;
      cursor:crosshair;background:rgba(0,0,0,.15);
    }
    .vtl-sel-box {
      position:fixed;border:2px dashed #e94560;
      background:rgba(233,69,96,.12);z-index:2147483644;
      pointer-events:none;
    }
    .vtl-sel-hint {
      position:fixed;top:12px;left:50%;transform:translateX(-50%);
      z-index:2147483644;background:#161b22;color:#e94560;
      padding:8px 20px;border-radius:8px;font:600 13px system-ui;
      box-shadow:0 4px 12px rgba(0,0,0,.5);border:1px solid #30363d;
    }
    /* ── context viewer modal ── */
    .vtl-ctx-modal {
      position:fixed;inset:0;z-index:2147483645;
      background:rgba(0,0,0,.55);
      display:flex;justify-content:center;align-items:center;
      backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
      font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
    }
    .vtl-ctx-modal-panel {
      width:52rem;max-width:92vw;max-height:80vh;
      background:#0d1117;border:1px solid #30363d;
      border-radius:14px;display:flex;flex-direction:column;
      box-shadow:0 20px 48px rgba(0,0,0,.55);overflow:hidden;
    }
    .vtl-ctx-modal-hdr {
      display:flex;align-items:center;gap:10px;
      padding:14px 18px;background:#161b22;
      border-bottom:1px solid #30363d;flex-shrink:0;
    }
    .vtl-ctx-modal-title {
      flex:1;font-weight:700;font-size:14px;color:#58a6ff;
    }
    .vtl-ctx-modal-close {
      background:transparent;color:#8b949e;border:1px solid #30363d;
      border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;
      transition:all .15s;
    }
    .vtl-ctx-modal-close:hover { background:#da3633;color:#fff;border-color:#da3633; }
    .vtl-ctx-modal-body {
      flex:1;overflow-y:auto;padding:16px 18px;
      scrollbar-width:thin;scrollbar-color:#30363d transparent;
    }
    .vtl-ctx-page {
      margin-bottom:14px;border-radius:8px;
      background:#161b22;border:1px solid #21262d;overflow:hidden;
    }
    .vtl-ctx-page-hdr {
      padding:9px 12px;font-size:12px;font-weight:600;color:#e6edf3;
      background:#1c2129;border-bottom:1px solid #21262d;
      display:flex;align-items:center;gap:7px;cursor:pointer;
      user-select:none;transition:background .15s;
    }
    .vtl-ctx-page-hdr:hover { background:#21262d; }
    .vtl-ctx-page-arrow {
      font-size:9px;transition:transform .2s;display:inline-block;
    }
    .vtl-ctx-page-arrow.open { transform:rotate(90deg); }
    .vtl-ctx-page-body {
      padding:12px;font-size:12px;color:#8b949e;
      line-height:1.65;white-space:pre-wrap;word-break:break-word;
      font-family:'Cascadia Code','Fira Code','Consolas',monospace;
    }
    .vtl-ctx-empty {
      text-align:center;padding:32px 12px;
      font-size:13px;color:#484f58;
    }
    .vtl-toast {
      position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
      background:#161b22;color:#e6edf3;border:1px solid #30363d;
      padding:8px 14px;border-radius:8px;z-index:2147483646;
      font-size:12px;box-shadow:0 8px 20px rgba(0,0,0,.45);
    }
    @media(max-width:900px){
      .vtl-right{display:none}
      .vtl-panel{width:96vw;height:92vh}
      .vtl-ctx-modal-panel{max-width:96vw;max-height:88vh}
    }
  `;

  function injectCSS() {
    if (document.getElementById("vtl-css")) return;
    const s = document.createElement("style");
    s.id = "vtl-css";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════
     Utilities
     ═══════════════════════════════════════════════════════ */
  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }
  function escAttr(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "vtl-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }
  function joinLines(lines) {
    return lines.filter(Boolean).join(" ");
  }
  function setChatDefaultHeight(chatEl) {
    if (!chatEl) return;
    requestAnimationFrame(() => {
      const rect = chatEl.getBoundingClientRect();
      if (!rect.height) return;
      const target = Math.max(170, rect.height * 0.6);
      chatEl.style.height = target + "px";
    });
  }

  /* ═══════════════════════════════════════════════════════
     Parser  (translation blocks only; skips stray [ANALYSIS])
     ═══════════════════════════════════════════════════════ */
  function parseBlocks(text) {
    const blocks = [];
    let cat = "TEXT", orig = null, trans = null;
    let inAnalysis = false;

    function flush() {
      if (orig !== null || trans !== null) {
        blocks.push({ cat, orig: orig || "", trans: trans || "" });
        orig = null; trans = null;
      }
    }

    for (const raw of text.split("\n")) {
      const line = raw.trim();

      if (/^\[ANALYSIS\]$/i.test(line)) {
        flush(); inAnalysis = true; continue;
      }

      const cm = line.match(/^\[(DIALOGUE|NARRATION|SFX|SIGN|TEXT)\]$/i);
      if (cm) {
        flush(); inAnalysis = false;
        cat = cm[1].toUpperCase(); continue;
      }

      if (inAnalysis) continue;

      const om = line.match(/^ORIGINAL:\s*(.*)$/i);
      if (om) { flush(); orig = om[1].trim(); continue; }
      const tm = line.match(/^TRANSLATION:\s*(.*)$/i);
      if (tm) { trans = tm[1].trim(); continue; }
    }
    flush();
    return blocks;
  }

  function buildRenderGroups(blocks) {
    const entries = blocks.map((block, index) => ({
      ...block,
      index,
      key: `${block.cat}|${block.orig}|${index}`
    }));
    const remaining = entries.slice();
    const used = new Set();
    const groups = [];

    let matchedCount = 0;
    if (customOrder?.groups?.length) {
      for (const group of customOrder.groups) {
        const matched = [];
        for (const wantedOrig of group) {
          const match = remaining.find(entry => !used.has(entry.key) && entry.orig === wantedOrig);
          if (match) {
            used.add(match.key);
            matched.push(match);
            matchedCount += 1;
          }
        }
        if (matched.length) groups.push(matched);
      }
    }

    for (const entry of remaining) {
      if (!used.has(entry.key)) groups.push([entry]);
    }

    currentRenderGroups = groups.map(groupBlocks => ({
      keys: groupBlocks.map(b => b.key),
      blocks: groupBlocks
    }));

    if (customOrder && (!customOrder.groups?.length || matchedCount === 0)) customOrder = null;

    return currentRenderGroups;
  }

  function buildManualOrderPayload() {
    if (!customOrder?.groups?.length) return null;
    return {
      groups: currentRenderGroups.map(group => group.blocks.map(block => block.orig).filter(Boolean))
    };
  }

  function buildCustomOrderFromGroups(groups) {
    return {
      groups: groups.map(group => group.blocks.map(block => block.orig).filter(Boolean))
    };
  }

  function getDropMode(event, target) {
    const rect = target.getBoundingClientRect();
    const offset = (event.clientY - rect.top) / rect.height;
    if (offset < 0.25) return "before";
    if (offset > 0.75) return "after";
    return "merge";
  }

  function clearDropClasses(el) {
    if (!el) return;
    el.classList.remove("vtl-drop-before", "vtl-drop-after", "vtl-drop-merge");
    delete el.dataset.dropMode;
  }

  function applyDragUpdate(fromIndex, toIndex, mode) {
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const groups = currentRenderGroups.map(group => ({
      keys: group.keys.slice(),
      blocks: group.blocks.slice()
    }));
    const [moving] = groups.splice(fromIndex, 1);
    if (!moving) return;

    if (mode === "merge") {
      const target = groups[toIndex];
      if (!target) return;
      target.blocks = target.blocks.concat(moving.blocks);
      target.keys = target.keys.concat(moving.keys);
    } else {
      let insertIndex = toIndex;
      if (mode === "after") insertIndex = toIndex + 1;
      if (fromIndex < insertIndex) insertIndex -= 1;
      groups.splice(insertIndex, 0, moving);
    }

    currentRenderGroups = groups;
    customOrder = buildCustomOrderFromGroups(groups);
    render(lastText, isStreaming);
    toast("Order updated. Retry to apply.");
  }

  /* ═══════════════════════════════════════════════════════
     Overlay / Panel
     ═══════════════════════════════════════════════════════ */
  let overlay = null, panelBody = null, ctxMenu = null, ctxBadge = null;
  let isStreaming = false, analysisOpen = false, currentImageUrl = null;
  let lastOverlayImageUrl = null;
  let currentAnalysis = "", ctxModal = null;
  let currentHistoryCount = 0;
  let analysisEnabled = true;
  let ignoreSfx = false;
  let lastText = "";
  let lastIncomingText = "";
  let appendHistoryText = "";
  let appendTranslations = true;
  let appendWarnMap = {};
  let appendBaseCount = 0;
  let globalBox = null, globalStatus = null, globalTextarea = null;
  let orderAuto = null, orderRtl = null, orderTtb = null;
  let ignoreSfxToggle = null;
  let appendToggle = null;
  let styleSelect = null;
  let overlayImage = null;
  let overlayImageWrap = null;
  let overlayImageHint = null;
  let overlaySelectActive = false;
  let overlaySelectBox = null;
  let warnMap = {};
  const noteMap = new Map();
  const noteTimers = new Map();
  let customOrder = null;
  let currentRenderGroups = [];
  let dragState = null;
  let docKeyHandler = null;
  let prevOverflow = "";
  let prevBodyOverflow = "";

  const STYLE_OPTIONS = [
    { id: "explicit", label: "Explicit / Faithful" },
    { id: "literal",  label: "Literal" },
    { id: "localized",label: "Localized / Smooth" },
    { id: "erotic",   label: "Erotic / Spicy" },
    { id: "crude",    label: "Crude / Raw" },
  ];

  function bindOverlayKeys() {
    if (docKeyHandler) return;
    docKeyHandler = (e) => {
      if (!overlay) return;
      if (overlaySelectActive && e.key === "Escape") {
        e.preventDefault();
        cancelOverlaySelection();
        return;
      }
      if (overlay.contains(e.target)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", docKeyHandler, true);
    document.addEventListener("keypress", docKeyHandler, true);
    document.addEventListener("keyup", docKeyHandler, true);
  }

  function unbindOverlayKeys() {
    if (!docKeyHandler) return;
    document.removeEventListener("keydown", docKeyHandler, true);
    document.removeEventListener("keypress", docKeyHandler, true);
    document.removeEventListener("keyup", docKeyHandler, true);
    docKeyHandler = null;
  }

  function updateBadge(count) {
    currentHistoryCount = count;
    if (!ctxBadge) return;
    if (count > 0) {
      ctxBadge.textContent = "📖 " + count + " page" + (count !== 1 ? "s" : "");
      ctxBadge.className = "vtl-badge-ctx vtl-has-ctx";
      ctxBadge.title = "Click to view stored context";
    } else {
      ctxBadge.textContent = "No context";
      ctxBadge.className = "vtl-badge-ctx";
      ctxBadge.title = "";
    }
  }

  async function initGlobals() {
    try {
      const resp = await browser.runtime.sendMessage({ action: "getGlobals" });
      if (resp?.globalInstructions != null && globalTextarea) {
        globalTextarea.value = resp.globalInstructions;
      }
      if (resp?.styleId && styleSelect) {
        styleSelect.value = resp.styleId;
      }
      if (resp?.readingOrder && orderAuto && orderRtl && orderTtb) {
        const { auto, rtl, ttb } = resp.readingOrder;
        orderAuto.checked = auto !== false;
        orderRtl.checked = !!rtl;
        orderTtb.checked = ttb !== false;
      }
      if (resp?.ignoreSfx != null && ignoreSfxToggle) {
        ignoreSfxToggle.checked = !!resp.ignoreSfx;
        ignoreSfx = !!resp.ignoreSfx;
      }
    } catch {}
  }

  function showOverlay(imageUrl, historyCount, analysisFlag, styleId, ignoreSfxFlag) {
    closeOverlay();
    injectCSS();
    isStreaming = true;
    analysisOpen = false;
    currentAnalysis = "";
    currentImageUrl = imageUrl;
    const isNewImage = imageUrl && imageUrl !== lastOverlayImageUrl;
    if (isNewImage) {
      appendHistoryText = "";
      appendWarnMap = {};
      appendBaseCount = 0;
      warnMap = {};
      lastIncomingText = "";
      lastText = "";
    } else {
      lastIncomingText = "";
    }
    lastOverlayImageUrl = imageUrl;
    if (!appendTranslations) {
      lastText = "";
      appendHistoryText = "";
      appendWarnMap = {};
      appendBaseCount = 0;
      warnMap = {};
    } else {
      lastText = appendHistoryText;
      warnMap = { ...appendWarnMap };
    }
    customOrder = null;
    currentRenderGroups = [];
    dragState = null;
    analysisEnabled = analysisFlag !== false;
    ignoreSfx = ignoreSfxFlag === true;
    prevOverflow = document.documentElement.style.overflow;
    prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    overlay = document.createElement("div");
    overlay.className = "vtl-overlay";
    overlay.addEventListener("click", e => { if (e.target === overlay) closeOverlay(); });
    bindOverlayKeys();

    const panel = document.createElement("div");
    panel.className = "vtl-panel";

    const accent = document.createElement("div");
    accent.className = "vtl-accent";

    const hdr = document.createElement("div");
    hdr.className = "vtl-header";

    const title = document.createElement("div");
    title.className = "vtl-title";
    title.innerHTML = '<span class="vtl-title-dot"></span> Translation';

    ctxBadge = document.createElement("span");
    updateBadge(historyCount || 0);
    ctxBadge.title = "Stored context pages in this tab";
    ctxBadge.addEventListener("click", () => {
      if (currentHistoryCount > 0) openCtxViewer();
    });
    title.appendChild(ctxBadge);

    styleSelect = document.createElement("select");
    styleSelect.className = "vtl-select";
    STYLE_OPTIONS.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.id; opt.textContent = o.label;
      styleSelect.appendChild(opt);
    });
    if (styleId) styleSelect.value = styleId;
    styleSelect.addEventListener("change", () => {
      browser.runtime.sendMessage({ action: "setStyle", styleId: styleSelect.value });
      toast("Style set: " + styleSelect.options[styleSelect.selectedIndex].text);
    });

    const clearBtn = Object.assign(document.createElement("button"),
      { className: "vtl-btn vtl-btn-clear", textContent: "🗑 Clear Context", title: "Clear stored context for this tab" });
    clearBtn.onclick = async () => {
      try {
        await browser.runtime.sendMessage({ action: "clearContext" });
        updateBadge(0);
        clearBtn.textContent = "✓ Cleared";
        setTimeout(() => { clearBtn.textContent = "🗑 Clear Context"; }, 1500);
      } catch {}
    };

    const analysisBtn = Object.assign(document.createElement("button"),
      { className: "vtl-btn", textContent: analysisEnabled ? "🧠 Image Analysis: On" : "🧠 Image Analysis: Off", title: "Toggle image analysis section" });
    analysisBtn.onclick = async () => {
      analysisEnabled = !analysisEnabled;
      analysisBtn.textContent = analysisEnabled ? "🧠 Image Analysis: On" : "🧠 Image Analysis: Off";
      if (!analysisEnabled) currentAnalysis = "";
      render(lastText, isStreaming);
      try {
        await browser.runtime.sendMessage({ action: "setAnalysisEnabled", enabled: analysisEnabled });
      } catch {}
    };

    const retryBtn = Object.assign(document.createElement("button"),
      { className: "vtl-btn", textContent: "⟳ Retry Translation", title: "Re-scan and retranslate the page" });
    retryBtn.onclick = () => {
      currentAnalysis = "";
      panelBody.innerHTML = '<div class="vtl-status vtl-pulse">Re-scanning image</div>';
      browser.runtime.sendMessage({ action: "retry", manualOrder: buildManualOrderPayload() });
    };

    const closeBtn = Object.assign(document.createElement("button"),
      { className: "vtl-btn", textContent: "✕ Close", title: "Close overlay" });
    closeBtn.onclick = closeOverlay;

    title.appendChild(clearBtn);
    hdr.append(title, styleSelect, analysisBtn, retryBtn, closeBtn);

    const content = document.createElement("div");
    content.className = "vtl-content";

    const left = document.createElement("div");
    left.className = "vtl-left";

    const info = document.createElement("div");
    info.className = "vtl-info";
    info.innerHTML =
      '<kbd>Retry Translation</kbd> re-scans for missed text · <kbd>Click</kbd> a line to retranslate · Drag on the image to select a region · Drag lines to reorder, drop center to merge · Per-line notes auto-retranslate';

    panelBody = document.createElement("div");
    panelBody.className = "vtl-body";
    panelBody.innerHTML = '<div class="vtl-status vtl-pulse">Analyzing image</div>';

    // Global instructions box
    globalBox = document.createElement("div");
    globalBox.className = "vtl-global";
    const glabel = document.createElement("div");
    glabel.className = "vtl-global-label";
    glabel.textContent = "Global Instructions (all tabs, resets on restart)";
    globalTextarea = document.createElement("textarea");
    globalTextarea.placeholder = 'e.g. "Ignore SFX" or "Character A is male"';
    const orderRow = document.createElement("div");
    orderRow.className = "vtl-order";
    const orderTitle = document.createElement("span");
    orderTitle.textContent = "Reading order:";
    orderAuto = document.createElement("input");
    orderAuto.type = "checkbox";
    orderAuto.checked = true;
    const orderAutoLabel = document.createElement("label");
    orderAutoLabel.append(orderAuto, document.createTextNode("Auto"));
    orderRtl = document.createElement("input");
    orderRtl.type = "checkbox";
    const orderRtlLabel = document.createElement("label");
    orderRtlLabel.append(orderRtl, document.createTextNode("Right-to-left"));
    orderTtb = document.createElement("input");
    orderTtb.type = "checkbox";
    orderTtb.checked = true;
    const orderTtbLabel = document.createElement("label");
    orderTtbLabel.append(orderTtb, document.createTextNode("Top-to-bottom"));
    const ignoreSfxLabel = document.createElement("label");
    ignoreSfxToggle = document.createElement("input");
    ignoreSfxToggle.type = "checkbox";
    ignoreSfxToggle.checked = ignoreSfx;
    ignoreSfxLabel.append(ignoreSfxToggle, document.createTextNode("Ignore SFX"));
    const appendLabel = document.createElement("label");
    appendToggle = document.createElement("input");
    appendToggle.type = "checkbox";
    appendToggle.checked = appendTranslations;
    appendLabel.append(appendToggle, document.createTextNode("Append translations"));
    orderRow.append(orderTitle, orderAutoLabel, orderRtlLabel, orderTtbLabel, ignoreSfxLabel, appendLabel);
    const gActions = document.createElement("div");
    gActions.className = "vtl-global-actions";
    const gApply = Object.assign(document.createElement("button"), { className: "vtl-btn", textContent: "Apply", title: "Save global instructions" });
    const gRetry = Object.assign(document.createElement("button"), { className: "vtl-btn", textContent: "Retranslate Page", title: "Retranslate using the current settings" });
    const gClear = Object.assign(document.createElement("button"), { className: "vtl-btn vtl-btn-clear", textContent: "Clear", title: "Clear global instructions" });
    globalStatus = document.createElement("span");
    globalStatus.className = "vtl-global-status";
    globalStatus.textContent = "";

    gApply.onclick = async () => {
      try {
        await browser.runtime.sendMessage({ action: "setGlobalInstructions", text: globalTextarea.value });
        globalStatus.textContent = "Saved";
        setTimeout(() => { if (globalStatus) globalStatus.textContent = ""; }, 1200);
      } catch {}
    };
    function syncReadingOrder() {
      if (!orderAuto || !orderRtl || !orderTtb) return;
      const payload = {
        auto: orderAuto.checked,
        rtl: orderRtl.checked,
        ttb: orderTtb.checked
      };
      browser.runtime.sendMessage({ action: "setReadingOrder", readingOrder: payload });
    }
    orderAuto.addEventListener("change", () => {
      if (orderAuto.checked) {
        orderRtl.checked = false;
        orderTtb.checked = true;
      }
      syncReadingOrder();
    });
    orderRtl.addEventListener("change", () => {
      if (orderRtl.checked) orderAuto.checked = false;
      syncReadingOrder();
    });
    orderTtb.addEventListener("change", () => {
      if (!orderTtb.checked) orderAuto.checked = false;
      syncReadingOrder();
    });
    ignoreSfxToggle.addEventListener("change", () => {
      ignoreSfx = ignoreSfxToggle.checked;
      browser.runtime.sendMessage({ action: "setIgnoreSfx", ignoreSfx });
      render(lastText, isStreaming);
    });
    appendToggle.addEventListener("change", () => {
      appendTranslations = appendToggle.checked;
      appendWarnMap = {};
      warnMap = {};
      appendBaseCount = 0;
      if (appendTranslations) {
        if (!isStreaming && lastIncomingText) {
          appendHistoryText = lastIncomingText;
        } else {
          appendHistoryText = "";
        }
        lastText = appendHistoryText || lastIncomingText;
      } else {
        appendHistoryText = "";
        lastText = lastIncomingText;
      }
      render(lastText, isStreaming);
    });
    gRetry.onclick = () => {
      browser.runtime.sendMessage({ action: "retry", manualOrder: buildManualOrderPayload() });
    };
    gClear.onclick = async () => {
      try {
        await browser.runtime.sendMessage({ action: "clearGlobalInstructions" });
        globalTextarea.value = "";
        globalStatus.textContent = "Cleared";
        setTimeout(() => { if (globalStatus) globalStatus.textContent = ""; }, 1200);
      } catch {}
    };

    gActions.append(gApply, gRetry, gClear, globalStatus);
    globalBox.append(glabel, globalTextarea, orderRow, gActions);

    left.append(info, panelBody, globalBox);

    // Right panel: image + chat
    const right = document.createElement("div");
    right.className = "vtl-right";

    const imgWrap = document.createElement("div");
    imgWrap.className = "vtl-image-wrap";
    overlayImageWrap = imgWrap;
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Source";
      img.draggable = false;
      imgWrap.appendChild(img);
      overlayImage = img;
      overlaySelectActive = true;
      imgWrap.classList.add("vtl-image-selecting");
    }
    overlayImageHint = document.createElement("div");
    overlayImageHint.className = "vtl-image-hint";
    overlayImageHint.textContent = "Drag to select a region · ESC to cancel";
    if (!imageUrl) overlayImageHint.style.display = "none";
    imgWrap.appendChild(overlayImageHint);
    attachOverlayImageSelection(imgWrap);

    const chat = document.createElement("div");
    chat.className = "vtl-chat";
    const chdr = document.createElement("div");
    chdr.className = "vtl-chat-hdr";
    chdr.textContent = "LLM Notes / Chat (text-only)";
    const cbody = document.createElement("div");
    cbody.className = "vtl-chat-body";
    const cinput = document.createElement("div");
    cinput.className = "vtl-chat-input";
    const ctext = document.createElement("textarea");
    ctext.placeholder = "Ask or explain context here…";
    const csend = Object.assign(document.createElement("button"),
      { className: "vtl-btn", textContent: "Send", title: "Send to LLM notes" });

    async function sendChat() {
      const text = ctext.value.trim();
      if (!text) return;
      ctext.value = "";
      const um = document.createElement("div");
      um.className = "vtl-msg user";
      um.textContent = text;
      cbody.appendChild(um);
      const am = document.createElement("div");
      am.className = "vtl-msg ai";
      am.textContent = "…";
      cbody.appendChild(am);
      cbody.scrollTop = cbody.scrollHeight;

      try {
        const r = await browser.runtime.sendMessage({ action: "chat", text });
        am.textContent = r?.reply || "(no reply)";
      } catch {
        am.textContent = "(error)";
      }
      cbody.scrollTop = cbody.scrollHeight;
    }

    csend.onclick = sendChat;
    ctext.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); sendChat();
      }
    });

    cinput.append(ctext, csend);
    chat.append(chdr, cbody, cinput);

    right.append(imgWrap, chat);

    content.append(left, right);
    panel.append(accent, hdr, content);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    setChatDefaultHeight(chat);
    initGlobals();
  }

  function closeOverlay() {
    closeCtxViewer();
    if (overlay) { overlay.remove(); overlay = null; panelBody = null; ctxBadge = null; }
    hideCtx();
    isStreaming = false;
    currentAnalysis = "";
    currentImageUrl = null;
    overlayImage = null;
    overlayImageWrap = null;
    overlayImageHint = null;
    overlaySelectActive = false;
    overlaySelectBox = null;
    document.documentElement.style.overflow = prevOverflow;
    document.body.style.overflow = prevBodyOverflow;
    unbindOverlayKeys();
  }

  function cancelOverlaySelection() {
    if (overlaySelectBox) {
      overlaySelectBox.remove();
      overlaySelectBox = null;
    }
  }

  function attachOverlayImageSelection(imgWrap) {
    imgWrap.addEventListener("mousedown", e => {
      if (!overlaySelectActive || !overlayImage) return;
      if (e.button !== 0) return;
      const imgRect = overlayImage.getBoundingClientRect();
      if (
        e.clientX < imgRect.left || e.clientX > imgRect.right ||
        e.clientY < imgRect.top || e.clientY > imgRect.bottom
      ) {
        return;
      }
      e.preventDefault();

      const wrapRect = imgWrap.getBoundingClientRect();
      const sx = clamp(e.clientX, imgRect.left, imgRect.right);
      const sy = clamp(e.clientY, imgRect.top, imgRect.bottom);

      if (overlaySelectBox) overlaySelectBox.remove();
      overlaySelectBox = document.createElement("div");
      overlaySelectBox.className = "vtl-image-sel-box";
      imgWrap.appendChild(overlaySelectBox);

      function onMove(e2) {
        const cx = clamp(e2.clientX, imgRect.left, imgRect.right);
        const cy = clamp(e2.clientY, imgRect.top, imgRect.bottom);
        const x1 = Math.min(sx, cx);
        const y1 = Math.min(sy, cy);
        const x2 = Math.max(sx, cx);
        const y2 = Math.max(sy, cy);
        Object.assign(overlaySelectBox.style, {
          left: (x1 - wrapRect.left) + "px",
          top: (y1 - wrapRect.top) + "px",
          width: (x2 - x1) + "px",
          height: (y2 - y1) + "px"
        });
      }

      function onUp(e2) {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", onUp);

        const ex = clamp(e2.clientX, imgRect.left, imgRect.right);
        const ey = clamp(e2.clientY, imgRect.top, imgRect.bottom);
        const x1 = Math.min(sx, ex);
        const y1 = Math.min(sy, ey);
        const w = Math.abs(ex - sx);
        const h = Math.abs(ey - sy);

        cancelOverlaySelection();

        if (w < 10 || h < 10) return;
        const crop = {
          x: Math.max(0, (x1 - imgRect.left) / imgRect.width),
          y: Math.max(0, (y1 - imgRect.top) / imgRect.height),
          w: Math.min(1, w / imgRect.width),
          h: Math.min(1, h / imgRect.height)
        };
        browser.runtime.sendMessage({
          action: "translateRegion",
          imageUrl: currentImageUrl,
          crop,
          pageUrl: location.href
        });
      }
      addEventListener("mousemove", onMove);
      addEventListener("mouseup", onUp);
    });
  }

  /* ══════════════════════════════════════════════════════
     Context viewer modal
     ═══════════════════════════════════════════════════════ */
  function closeCtxViewer() {
    if (ctxModal) { ctxModal.remove(); ctxModal = null; }
  }

  async function openCtxViewer() {
    closeCtxViewer();

    let pages;
    try {
      const resp = await browser.runtime.sendMessage({ action: "getHistory" });
      pages = resp?.history || [];
    } catch { pages = []; }

    ctxModal = document.createElement("div");
    ctxModal.className = "vtl-ctx-modal";
    ctxModal.addEventListener("click", e => { if (e.target === ctxModal) closeCtxViewer(); });

    const panel = document.createElement("div");
    panel.className = "vtl-ctx-modal-panel";

    /* header */
    const hdr = document.createElement("div");
    hdr.className = "vtl-ctx-modal-hdr";

    const title = document.createElement("div");
    title.className = "vtl-ctx-modal-title";
    title.textContent = "Stored Context — " + pages.length + " page" + (pages.length !== 1 ? "s" : "");

    const closeBtn = document.createElement("button");
    closeBtn.className = "vtl-ctx-modal-close";
    closeBtn.textContent = "✕ Close";
    closeBtn.onclick = closeCtxViewer;

    hdr.append(title, closeBtn);

    /* body */
    const body = document.createElement("div");
    body.className = "vtl-ctx-modal-body";

    if (!pages.length) {
      body.innerHTML = '<div class="vtl-ctx-empty">No stored context yet.<br>Context accumulates as you translate pages in this tab.</div>';
    } else {
      /* track which pages are expanded (default: last page open) */
      const openState = pages.map((_, i) => i === pages.length - 1);

      pages.forEach((text, i) => {
        const page = document.createElement("div");
        page.className = "vtl-ctx-page";

        const pageHdr = document.createElement("div");
        pageHdr.className = "vtl-ctx-page-hdr";

        const arrow = document.createElement("span");
        arrow.className = "vtl-ctx-page-arrow" + (openState[i] ? " open" : "");
        arrow.textContent = "▶";

        const label = document.createElement("span");
        label.textContent = "Page " + (i + 1) + " of " + pages.length;

        /* line count hint */
        const lineCount = text.split("\n").filter(l => l.trim()).length;
        const hint = document.createElement("span");
        hint.style.cssText = "margin-left:auto;font-size:10px;color:#484f58;font-weight:400";
        hint.textContent = lineCount + " lines";

        pageHdr.append(arrow, label, hint);

        const pageBody = document.createElement("div");
        pageBody.className = "vtl-ctx-page-body";
        pageBody.textContent = text;
        pageBody.style.display = openState[i] ? "block" : "none";

        pageHdr.addEventListener("click", () => {
          openState[i] = !openState[i];
          pageBody.style.display = openState[i] ? "block" : "none";
          arrow.classList.toggle("open", openState[i]);
        });

        page.append(pageHdr, pageBody);
        body.appendChild(page);
      });
    }

    panel.append(hdr, body);
    ctxModal.appendChild(panel);
    document.body.appendChild(ctxModal);
  }

  /* ═══════════════════════════════════════════════════════
     Render helpers
     ═══════════════════════════════════════════════════════ */
  function attachAnalysisToggle() {
    const hdr = panelBody?.querySelector("[data-vtl-toggle]");
    if (!hdr) return;
    hdr.addEventListener("click", () => {
      analysisOpen = !analysisOpen;
      const body  = hdr.nextElementSibling;
      const arrow = hdr.querySelector(".vtl-analysis-arrow");
      body.style.display = analysisOpen ? "block" : "none";
      if (arrow) arrow.classList.toggle("open", analysisOpen);
    });
  }

  function buildAnalysisHTML() {
    if (!analysisEnabled || !currentAnalysis) return "";
    return '<div class="vtl-analysis">' +
      '<div class="vtl-analysis-hdr" data-vtl-toggle>' +
        '<span class="vtl-analysis-arrow' + (analysisOpen ? " open" : "") + '">▶</span>' +
        ' Image Analysis' +
      '</div>' +
      '<div class="vtl-analysis-body" style="display:' + (analysisOpen ? "block" : "none") + '">' +
        esc(currentAnalysis) +
      '</div></div>';
  }

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */
  function render(text, live) {
    if (!panelBody) return;
    const blocks = parseBlocks(text).filter(block => !ignoreSfx || block.cat !== "SFX");
    const groups = buildRenderGroups(blocks);

    let html = buildAnalysisHTML();

    if (!blocks.length) {
      if (text.trim()) {
        html += '<div class="vtl-raw">' + esc(text) + "</div>";
      }
      if (live) {
        html += '<div class="vtl-status vtl-pulse">Translating</div>';
      }
      panelBody.innerHTML = html;
      attachAnalysisToggle();
      return;
    }

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupBlocks = group.blocks;
      if (!groupBlocks.length) continue;
      const merged = groupBlocks.length > 1;
      const combinedOrig = joinLines(groupBlocks.map(b => b.orig));
      const combinedTrans = joinLines(groupBlocks.map(b => b.trans));
      const cat = groupBlocks[0].cat || "TEXT";
      const key = groupBlocks.map(b => b.key).join("||");
      const warn = groupBlocks.some(b => warnMap[b.index]);
      html += '<div class="vtl-block' + (warn ? " vtl-warn" : "") + '" data-i="' + i + '" data-group="' + i + '" draggable="true">' +
        (warn ? '<span class="vtl-warn-tag" title="' + escAttr(warn) + '">⚠</span>' : "") +
        (merged ? '<span class="vtl-merge-tag">Merged</span>' : "") +
        '<span class="vtl-badge vtl-badge-' + cat.toLowerCase() + '">' + cat + "</span>" +
        '<div class="vtl-orig">' + esc(combinedOrig) + "</div>" +
        '<div class="vtl-trans" data-orig="' + escAttr(combinedOrig) + '">' + esc(combinedTrans) + "</div>" +
        '<textarea class="vtl-note" rows="1" data-key="' + escAttr(key) + '" placeholder="Note for this line (auto-retranslate)…"></textarea>' +
        "</div>";
    }
    if (live) html += '<div class="vtl-status vtl-pulse">Translating</div>';

    panelBody.innerHTML = html;
    attachAnalysisToggle();
    panelBody.querySelectorAll(".vtl-block").forEach(el => {
      el.addEventListener("click", onCtx);
      el.addEventListener("dragstart", e => {
        const groupIndex = Number(el.dataset.group);
        if (Number.isNaN(groupIndex)) return;
        dragState = { groupIndex };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
        el.classList.add("vtl-dragging");
      });
      el.addEventListener("dragend", () => {
        dragState = null;
        el.classList.remove("vtl-dragging");
        panelBody.querySelectorAll(".vtl-block").forEach(clearDropClasses);
      });
      el.addEventListener("dragover", e => {
        if (!dragState) return;
        e.preventDefault();
        const mode = getDropMode(e, el);
        clearDropClasses(el);
        el.dataset.dropMode = mode;
        el.classList.add("vtl-drop-" + mode);
      });
      el.addEventListener("dragleave", () => {
        clearDropClasses(el);
      });
      el.addEventListener("drop", e => {
        if (!dragState) return;
        e.preventDefault();
        const mode = el.dataset.dropMode || "merge";
        const targetIndex = Number(el.dataset.group);
        if (!Number.isNaN(targetIndex)) {
          applyDragUpdate(dragState.groupIndex, targetIndex, mode);
        }
        dragState = null;
        panelBody.querySelectorAll(".vtl-block").forEach(clearDropClasses);
      });
    });

    // attach note inputs
    panelBody.querySelectorAll(".vtl-note").forEach(note => {
      const key = note.dataset.key || "";
      note.value = noteMap.get(key) || "";
      note.addEventListener("input", () => {
        if (isStreaming) return;
        const val = note.value.trim();
        const prev = noteMap.get(key) || "";
        noteMap.set(key, val);

        if (noteTimers.has(key)) clearTimeout(noteTimers.get(key));
        noteTimers.set(key, setTimeout(async () => {
          if (!val && !prev) return;

          const block = note.closest(".vtl-block");
          const transEl = block?.querySelector(".vtl-trans");
          const orig = transEl?.dataset.orig || "";
          const current = transEl?.textContent || "";

          if (!orig) return;

          transEl.innerHTML = '<span style="color:#484f58;font-style:italic">Retranslating…</span>';
          try {
            const r = await browser.runtime.sendMessage({
              action: "retranslateEntryWithNote",
              original: orig,
              note: val,
              currentTranslation: current,
              styleId: styleSelect?.value || "explicit"
            });
            transEl.textContent = r.translation || "(empty)";
          } catch {
            transEl.textContent = current;
          }
        }, 700));
      });
    });

    if (live) {
      const gap = panelBody.scrollHeight - panelBody.scrollTop - panelBody.clientHeight;
      if (gap < 120) panelBody.scrollTop = panelBody.scrollHeight;
    }
  }

  /* ═══════════════════════════════════════════════════════
     Context menu — 3 retranslation styles
     ═══════════════════════════════════════════════════════ */
  function hideCtx() { if (ctxMenu) { ctxMenu.remove(); ctxMenu = null; } }

  function onCtx(e) {
    if (e.target.closest(".vtl-note")) return;
    e.preventDefault();
    e.stopPropagation();
    hideCtx();

    const transEl = e.currentTarget.querySelector(".vtl-trans");
    if (!transEl) return;
    const orig = transEl.dataset.orig;
    if (!orig) return;

    const menu = document.createElement("div");
    menu.className = "vtl-ctx";

    const opts = [
      { icon: "📋", label: "Standard", desc: "Default manga translation",            style: "standard" },
      { icon: "🔤", label: "Literal",  desc: "Word-for-word, preserves structure",   style: "literal"  },
      { icon: "✨", label: "Natural",  desc: "Fully localized smooth English",       style: "natural"  },
    ];

    opts.forEach((o, i) => {
      const item = document.createElement("div");
      item.className = "vtl-ctx-item";
      item.textContent = o.icon + "  " + o.label;
      item.onclick = () => doRetranslate(orig, o.style, transEl);
      menu.appendChild(item);

      const desc = document.createElement("div");
      desc.className = "vtl-ctx-desc";
      desc.textContent = o.desc;
      menu.appendChild(desc);

      if (i < opts.length - 1) {
        const sep = document.createElement("div");
        sep.className = "vtl-ctx-sep";
        menu.appendChild(sep);
      }
    });

    document.body.appendChild(menu);
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.min(e.clientX, innerWidth  - mw - 8) + "px";
    menu.style.top  = Math.min(e.clientY, innerHeight - mh - 8) + "px";
    ctxMenu = menu;
    setTimeout(() => addEventListener("click", hideCtx, { once: true }), 0);
  }

  async function doRetranslate(orig, style, el) {
    hideCtx();
    const prev = el.textContent;
    el.innerHTML = '<span style="color:#484f58;font-style:italic">Retranslating (' + style + ')…</span>';
    try {
      const r = await browser.runtime.sendMessage(
        { action: "retranslateEntry", original: orig, style });
      el.textContent = r.translation || "(empty)";
    } catch {
      el.textContent = prev;
    }
  }

  /* ═══════════════════════════════════════════════════════
     Region selector
     ═══════════════════════════════════════════════════════ */
  let selOverlay = null;

  function startSel(imageUrl, pageUrl) {
    if (selOverlay) selOverlay.remove();
    injectCSS();

    selOverlay = document.createElement("div");
    selOverlay.className = "vtl-sel";

    const hint = document.createElement("div");
    hint.className = "vtl-sel-hint";
    hint.textContent = "Draw a rectangle over the area to translate · ESC to cancel";
    selOverlay.appendChild(hint);

    let sx, sy, box;

    selOverlay.addEventListener("mousedown", e => {
      sx = e.clientX; sy = e.clientY;
      box = document.createElement("div");
      box.className = "vtl-sel-box";
      document.body.appendChild(box);

      function onMove(e2) {
        const x = Math.min(sx, e2.clientX), y = Math.min(sy, e2.clientY);
        const w = Math.abs(e2.clientX - sx), h = Math.abs(e2.clientY - sy);
        Object.assign(box.style, { left: x+"px", top: y+"px", width: w+"px", height: h+"px" });
      }
      function onUp(e2) {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", onUp);
        if (selOverlay) { selOverlay.remove(); selOverlay = null; }
        if (box) { box.remove(); box = null; }

        const ir = findImageRect(imageUrl, sx, sy, e2.clientX, e2.clientY);
        const x = Math.min(sx, e2.clientX), y = Math.min(sy, e2.clientY);
        const w = Math.abs(e2.clientX - sx), h = Math.abs(e2.clientY - sy);
        if (w < 10 || h < 10 || !ir) {
          if (!ir) toast("Could not find the source image on this page.");
          return;
        }

        const crop = {
          x: Math.max(0, (x - ir.left) / ir.width),
          y: Math.max(0, (y - ir.top) / ir.height),
          w: Math.min(1, w / ir.width),
          h: Math.min(1, h / ir.height),
        };
        browser.runtime.sendMessage({ action: "translateRegion", imageUrl, crop, pageUrl });
      }
      addEventListener("mousemove", onMove);
      addEventListener("mouseup", onUp);
    });

    function onKey(e) {
      if (e.key === "Escape") {
        if (selOverlay) { selOverlay.remove(); selOverlay = null; }
        removeEventListener("keydown", onKey);
      }
    }
    addEventListener("keydown", onKey);
    document.body.appendChild(selOverlay);
  }

  function findImageRect(imageUrl, sx, sy, ex, ey) {
    let targetUrl = imageUrl;
    try { targetUrl = new URL(imageUrl, location.href).href; } catch {}
    const imgs = Array.from(document.images || []);
    const directMatch = imgs.find(img => {
      const src = img.currentSrc || img.src || "";
      return src === targetUrl;
    });
    if (directMatch) return directMatch.getBoundingClientRect();

    const looseMatch = imgs.find(img => {
      const src = img.currentSrc || img.src || "";
      return src.includes(imageUrl);
    });
    if (looseMatch) return looseMatch.getBoundingClientRect();

    function elementRectForUrl(el) {
      if (!el) return null;
      if (el.tagName === "IMG") return el.getBoundingClientRect();
      const bg = getComputedStyle(el).backgroundImage || "";
      if (!bg || bg === "none") return null;
      const match = bg.match(/url\(["']?(.*?)["']?\)/i);
      if (!match) return null;
      const bgUrl = match[1];
      if (!bgUrl) return null;
      if (bgUrl === imageUrl || bgUrl === targetUrl || bgUrl.includes(imageUrl)) {
        return el.getBoundingClientRect();
      }
      return null;
    }

    const pointEl = document.elementFromPoint(sx, sy);
    const pointImg = pointEl?.closest && pointEl.closest("img");
    if (pointImg) return pointImg.getBoundingClientRect();
    const pointRect = elementRectForUrl(pointEl);
    if (pointRect) return pointRect;

    const centerEl = document.elementFromPoint(
      (sx + ex) / 2,
      (sy + ey) / 2
    );
    const centerImg = centerEl?.closest && centerEl.closest("img");
    if (centerImg) return centerImg.getBoundingClientRect();
    const centerRect = elementRectForUrl(centerEl);
    if (centerRect) return centerRect;

    const endEl = document.elementFromPoint(ex, ey);
    const endImg = endEl?.closest && endEl.closest("img");
    if (endImg) return endImg.getBoundingClientRect();
    return elementRectForUrl(endEl);
  }

  /* ═══════════════════════════════════════════════════════
     Message listener
     ═══════════════════════════════════════════════════════ */
  browser.runtime.onMessage.addListener(msg => {
    switch (msg.action) {
      case "showOverlay":
        showOverlay(msg.imageUrl, msg.historyCount || 0, msg.analysisEnabled, msg.styleId, msg.ignoreSfx);
        break;
      case "analysis":
        if (!analysisEnabled) break;
        currentAnalysis = msg.text || "";
        if (panelBody) render(lastText, true);
        break;
      case "chunk":
        if (!isStreaming) {
          appendBaseCount = appendTranslations ? parseBlocks(appendHistoryText).length : 0;
        }
        isStreaming = true;
        lastIncomingText = msg.text || "";
        if (appendTranslations) {
          lastText = appendHistoryText ? appendHistoryText + "\n\n" + lastIncomingText : lastIncomingText;
        } else {
          lastText = lastIncomingText;
        }
        render(lastText, true);
        break;
      case "done":
        isStreaming = false;
        lastIncomingText = msg.text || "";
        if (appendTranslations) {
          appendHistoryText = appendHistoryText
            ? appendHistoryText + "\n\n" + lastIncomingText
            : lastIncomingText;
          lastText = appendHistoryText;
        } else {
          lastText = lastIncomingText;
        }
        render(lastText, false);
        if (msg.historyCount != null) updateBadge(msg.historyCount);
        break;
      case "quality":
        warnMap = {};
        if (appendTranslations) {
          warnMap = { ...appendWarnMap };
          const offset = appendBaseCount;
          (msg.items || []).forEach(it => {
            warnMap[it.index + offset] = it.reason || "Low confidence";
          });
          appendWarnMap = warnMap;
        } else {
          (msg.items || []).forEach(it => { warnMap[it.index] = it.reason || "Low confidence"; });
        }
        render(lastText, isStreaming);
        break;
      case "globalInstructionUpdate":
        if (globalTextarea) {
          globalTextarea.value = msg.text || "";
          toast("Global instruction added");
        }
        break;
      case "error":
        isStreaming = false;
        if (panelBody)
          panelBody.innerHTML = '<div class="vtl-status vtl-err">' + esc(msg.message) + "</div>";
        break;
      case "showSelector":
        startSel(msg.imageUrl, msg.pageUrl);
        break;
    }
  });
})();
