"use strict";

// ========================= CONFIGURATION =========================
const LLAMA_SERVER = "http://127.0.0.1:8033";
const TARGET_LANG  = "English";
const MAX_TOKENS   = 2048;
const TEMPERATURE  = 0.2;
const RETRY_TEMP   = 0.5;
const IMG_MAX_DIM  = 1024;

const REPEAT_PENALTY       = 1.15;
const REPEAT_LAST_N        = 256;
const FREQUENCY_PENALTY    = 0.3;
const PRESENCE_PENALTY     = 0.2;
const DRY_MULTIPLIER       = 0.8;
const DRY_BASE             = 1.75;
const DRY_ALLOWED_LENGTH   = 2;
const DRY_PENALTY_LAST_N   = -1;
const LOOP_THRESHOLD       = 3;

const tabState = {};

// =================== Global instructions (all tabs, reset on restart) ===================
let globalInstructions = "";

// =================== Style profiles ===================
const STYLE_PROFILES = {
  explicit: {
    label: "Explicit / Faithful",
    prompt: "Default adult manga translation. Faithful, natural, uncensored. Keep honorifics and tone.",
  },
  literal: {
    label: "Literal",
    prompt: "Word-for-word, preserve structure. Keep honorifics. Romanize SFX and add meaning in parentheses.",
  },
  localized: {
    label: "Localized / Smooth",
    prompt: "Rewrite for natural English. Adapt idioms. Honorifics may be dropped if it reads better.",
  },
  erotic: {
    label: "Erotic / Spicy",
    prompt: "Keep meaning but make the language more sensual, fluid, and arousing. Still uncensored.",
  },
  crude: {
    label: "Crude / Raw",
    prompt: "Preserve vulgarity and harshness. Avoid softening. Keep the raw tone.",
  },
};
const DEFAULT_STYLE = "explicit";

function getStyleId(tid) {
  return tabState[tid]?.styleId || DEFAULT_STYLE;
}

function getIgnoreSfx(tid) {
  return tabState[tid]?.ignoreSfx ?? false;
}

function getReadingOrder(tid) {
  return tabState[tid]?.readingOrder || { auto: true, rtl: false, ttb: true };
}

// =================== Page history for translation continuity ===================
const pageHistory = {};
const MAX_HISTORY  = 3;

function getHist(tid)  { return pageHistory[tid] || []; }
function pushHist(tid, text) {
  if (!pageHistory[tid]) pageHistory[tid] = [];
  pageHistory[tid].push(text);
  if (pageHistory[tid].length > MAX_HISTORY) pageHistory[tid].shift();
}
function replaceLastHist(tid, text) {
  if (pageHistory[tid]?.length) {
    pageHistory[tid][pageHistory[tid].length - 1] = text;
  } else {
    pushHist(tid, text);
  }
}
function clearHist(tid) { delete pageHistory[tid]; }

function getAnalysisEnabled(tid) {
  return tabState[tid]?.analysisEnabled ?? true;
}

// =================== Filter translation output to only context-relevant content ===================
function filterForContext(translationText, analysis) {
  const lines = translationText.split("\n");
  let cat = null, trans = null;
  const kept = [];

  function flush() {
    if (trans !== null && (cat === "DIALOGUE" || cat === "NARRATION")) {
      kept.push("[" + cat + "] " + trans);
    }
    trans = null;
  }

  for (const raw of lines) {
    const line = raw.trim();
    const cm = line.match(/^\[(DIALOGUE|NARRATION|SFX|SIGN|TEXT)\]$/i);
    if (cm) { flush(); cat = cm[1].toUpperCase(); continue; }
    const tm = line.match(/^TRANSLATION:\s*(.*)$/i);
    if (tm) { trans = tm[1].trim(); continue; }
  }
  flush();

  let result = "";
  if (analysis) result += "Scene: " + analysis + "\n";
  if (kept.length) result += kept.join("\n");
  return result.trim();
}

function filterSfxBlocks(text) {
  const blocks = parseBlocksForQA(text);
  if (!blocks.length) return text;
  const kept = blocks.filter(block => block.cat !== "SFX");
  if (!kept.length) return "No translatable text found.";
  return kept.map(block =>
    `[${block.cat}]\nORIGINAL: ${block.orig}\nTRANSLATION: ${block.trans}`
  ).join("\n\n");
}

// =================== Story registry (compact running context per tab) ===================
const storyRegistry = {};
function getRegistry(tid)      { return storyRegistry[tid] || ""; }
function setRegistry(tid, val) { storyRegistry[tid] = val; }

async function updateStoryRegistry(tabId, analysis, filteredTranslation) {
  const current = getRegistry(tabId);

  const prompt = [
    "You maintain a compact story registry for a manga being translated page-by-page.",
    "Given the current registry and the latest page, output an UPDATED registry.",
    "",
    "RULES:",
    "- List each named CHARACTER with one short visual identifier and speech style",
    "- Note how characters ADDRESS each other (honorifics, nicknames)",
    "- Note key RELATIONSHIPS between characters",
    "- Summarize the CURRENT SITUATION in 1-2 sentences",
    "- Drop details that no longer matter for future translation",
    "- MAXIMUM 10 lines total. Be extremely concise.",
    "- If a character has not been named yet, use a placeholder like 'unnamed man'",
    "",
    "CURRENT REGISTRY:",
    current || "(empty – first page)",
    "",
    "LATEST PAGE:",
    analysis ? "Scene: " + analysis : "",
    filteredTranslation,
    "",
    "Output ONLY the updated registry, nothing else:"
  ].join("\n");

  try {
    const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
        stream: false
      })
    });
    const data = await res.json();
    let updated = data.choices?.[0]?.message?.content?.trim();
    if (updated) {
      updated = cleanOutput(updated);
      setRegistry(tabId, updated);
    }
  } catch (e) {
    console.warn("Registry update failed, keeping previous:", e);
  }
}

// =================== REFERER INJECTION ===================
let pendingReferer = "";

browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!pendingReferer || details.tabId !== -1) return {};
    const headers = details.requestHeaders.filter(
      h => h.name.toLowerCase() !== "referer"
    );
    headers.push({ name: "Referer", value: pendingReferer });
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
  ["blocking", "requestHeaders"]
);

// =================== SYSTEM PROMPTS — Scene analysis (stage 1) ===================
const SYS_ANALYSE =
`You are an expert manga/manhwa/manhua page analyst. Examine the image and write a brief scene analysis (2-4 sentences).

Cover: what is happening in the scene, who appears to be speaking (if dialogue is visible), and the emotional tone or mood.

If previously established character or story context is provided, use it to identify returning characters by name rather than re-describing them.

Your FINAL sentence MUST state the detected source language and reading direction in this exact format:
"Source: Japanese manga, read right-to-left." or "Source: Korean manhwa, read left-to-right." or "Source: Chinese manhua, read left-to-right."

Output ONLY the analysis text. No formatting, no labels, no headers, no translation.`;

const USER_ANALYSE = "Briefly analyse this manga/manhwa page. /no_think";

// =================== SYSTEM PROMPTS — Main translation (stage 2) ===================
const SYS_NORMAL =
`You are an expert translator for Japanese manga, including adult and explicit (18+) content. Translate ALL text accurately and completely — never censor, omit, or sanitize anything regardless of sexual, violent, or vulgar content.

If GLOBAL INSTRUCTIONS or a STYLE PROFILE are provided in the user message, follow them even if they override default rules.

If a scene analysis or previous page translations are provided for context, use them to maintain consistency in character names, honorifics, tone, and terminology.

Translate all text in images into ${TARGET_LANG}. Use this exact format, one blank line between entries:

[CATEGORY]
ORIGINAL: <source text>
TRANSLATION: <translated text>

Categories: DIALOGUE (speech bubbles), NARRATION (caption boxes, inner monologue), SFX (sound effects, moans, gasps, wet sounds, impact sounds — ALL of them), SIGN (signs, labels, posters), TEXT (other).

Translation rules:
• Produce natural, fluent ${TARGET_LANG} that reads well in manga speech bubbles.
• Translate moans, sexual sounds, and onomatopoeia into natural ${TARGET_LANG} equivalents (e.g. あっ→Ahh, んっ→Nnh, ずぷ→*squelch*, パンパン→*slap slap*).
• Preserve the tone and intensity of dialogue — crude language stays crude, soft language stays soft.
• Translate dirty talk, pillow talk, and explicit dialogue faithfully without toning it down.
• Keep honorifics (-san, -sama, -sensei, -chan, -kun, onii-chan, senpai, etc.) as-is unless a STYLE PROFILE says otherwise.
• For SIGN or TEXT that label an object (like a phone screen or a label tag), add the object context in English, e.g. "Phone screen: Dad" or "Sign: Chigusa Inn".

The correct reading order is specified in the user message — follow it exactly. Do NOT guess a different order.
If no order is specified, detect the source language and use:
• Japanese (manga): RIGHT to LEFT, top to bottom.
• Korean (manhwa): LEFT to RIGHT, top to bottom.
• Chinese (manhua): LEFT to RIGHT for modern; RIGHT to LEFT for traditional vertical.

Each text region must appear ONLY ONCE. Do not repeat entries.
When all text is translated, stop immediately.`;

const SYS_RETRY =
`You are re-examining this image because text may have been missed on a previous attempt.
You are an expert translator for Japanese manga, including adult and explicit (18+) content. Translate ALL text accurately — never censor, omit, or sanitize anything.

If GLOBAL INSTRUCTIONS or a STYLE PROFILE are provided in the user message, follow them even if they override default rules.

If a scene analysis or previous page translations are provided for context, use them to maintain consistency in character names, honorifics, tone, and terminology.

Be EXTREMELY thorough. Scan every part of the image — all corners, edges, backgrounds, small print, overlapping text, partially obscured text, AND small sound effects (moans, gasps, wet sounds, impacts).

Translate ALL text into ${TARGET_LANG} using this exact format, one blank line between entries:

[CATEGORY]
ORIGINAL: <source text>
TRANSLATION: <translated text>

Categories: DIALOGUE (speech bubbles), NARRATION (caption boxes, inner monologue), SFX (sound effects, moans, gasps, wet sounds, impact sounds — ALL of them), SIGN (signs, labels, posters), TEXT (other).

Translation rules:
• Produce natural, fluent ${TARGET_LANG} that reads well in manga speech bubbles.
• Translate moans, sexual sounds, and onomatopoeia into natural ${TARGET_LANG} equivalents.
• Preserve tone and intensity — crude stays crude, soft stays soft.
• Translate explicit dialogue faithfully without toning it down.
• Keep honorifics (-san, -sama, -sensei, -chan, -kun, onii-chan, senpai, etc.) as-is unless a STYLE PROFILE says otherwise.
• For SIGN or TEXT that label an object (like a phone screen or a label tag), add the object context in English, e.g. "Phone screen: Dad" or "Sign: Chigusa Inn".

The correct reading order is specified in the user message — follow it exactly. Do NOT guess a different order.
If no order is specified, detect the source language and use:
• Japanese (manga): RIGHT to LEFT, top to bottom.
• Korean (manhwa): LEFT to RIGHT, top to bottom.
• Chinese (manhua): LEFT to RIGHT for modern; RIGHT to LEFT for traditional vertical.

Do NOT skip any text, no matter how small. Include every sound effect, sign, watermark, and background text.
Each text region must appear ONLY ONCE. Stop when all text is translated.`;

const USER_NORMAL = `Translate all text in this image into ${TARGET_LANG}. Include every sound effect, moan, and background text. Use correct reading order for the detected source language. Each piece of text must appear only once. /no_think`;
const USER_RETRY  = `This is a RETRY. Look more carefully at every part of the image. Translate ALL visible text into ${TARGET_LANG}, including small sound effects, moans, gasps, signs, and background text that may have been missed before. Use correct reading order. /no_think`;

// =================== RETRANSLATION PROMPTS — 3 styles ===================
const SYS_RETRANSLATE_STANDARD =
`You translate Japanese manga text into ${TARGET_LANG}, specializing in adult and explicit (18+) content. This is the standard manga translation style.

If GLOBAL INSTRUCTIONS or a STYLE PROFILE are provided in the user message, follow them even if they override defaults.

Rules:
• Produce natural, fluent ${TARGET_LANG} that reads well in manga speech bubbles and narration boxes.
• Keep all honorifics as-is: -san, -sama, -chan, -kun, -sensei, -senpai, onii-chan, onee-san, etc.
• Translate onomatopoeia and SFX into expressive ${TARGET_LANG} equivalents with asterisks.
• Translate moans and sexual sounds into natural phonetic equivalents.
• Preserve the tone and intensity exactly — crude stays crude, tender stays tender, comedic stays comedic.
• Translate all explicit and sexual dialogue faithfully. Never censor, omit, or soften anything.
• Use natural contractions and casual phrasing where appropriate for dialogue.
• Output ONLY the translated text. No commentary, notes, or explanations.`;

const SYS_RETRANSLATE_LITERAL =
`You translate Japanese text literally into ${TARGET_LANG} for manga readers who want to understand the original phrasing as closely as possible.

If GLOBAL INSTRUCTIONS or a STYLE PROFILE are provided in the user message, follow them even if they override defaults.

Rules for LITERAL translation:
• Translate word-by-word, preserving Japanese sentence structure and word order even if the result sounds stiff or unnatural in ${TARGET_LANG}.
• Keep ALL honorifics exactly as-is.
• Keep Japanese name order (family name first) if that is the original order.
• For onomatopoeia and SFX, provide the romanized Japanese followed by the meaning in parentheses.
• Do NOT localize idioms — translate them literally and add the meaning in parentheses if unclear.
• Preserve stuttering, elongation, and vocal quirks exactly.
• Sexual and explicit content must be translated faithfully with no censorship or softening.
• Output ONLY the translated text. No commentary, no notes outside parenthetical clarifications.`;

const SYS_RETRANSLATE_NATURAL =
`You translate Japanese text into smooth, natural ${TARGET_LANG} for manga readers who want maximum readability — as if the text were originally written in ${TARGET_LANG}.

If GLOBAL INSTRUCTIONS or a STYLE PROFILE are provided in the user message, follow them even if they override defaults.

Rules for NATURAL translation:
• Rewrite the text so it sounds like a native ${TARGET_LANG} speaker wrote it. Prioritize flow and readability above all.
• REMOVE or adapt honorifics to ${TARGET_LANG} equivalents where possible.
• Convert Japanese idioms into equivalent ${TARGET_LANG} idioms or natural phrasing.
• Convert onomatopoeia and SFX into vivid ${TARGET_LANG} action descriptions.
• Adapt cultural references so a Western reader understands immediately without footnotes.
• Dialogue must feel like real people talking — use contractions, casual phrasing, slang, and natural rhythm.
• Sexual and explicit content must be translated faithfully with no censorship — make it sound natural and fluid.
• Output ONLY the translated text. No commentary, no explanations.`;

// =================== CONTEXT MENUS ===================
browser.contextMenus.create({
  id: "vision-select-translate", title: "🔍 Select & Translate Region", contexts: ["image"],
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const imageUrl = info.srcUrl;
  const pageUrl  = info.pageUrl || "";

  if (info.menuItemId === "vision-select-translate") {
    try { await tell(tab.id, { action: "showSelector", imageUrl, pageUrl }); }
    catch { await browser.tabs.executeScript(tab.id, { file: "content.js" }); await tell(tab.id, { action: "showSelector", imageUrl, pageUrl }); }
  }
});

// =================== MESSAGE HANDLING ===================
browser.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;

  if (msg.action === "retranslateEntry") {
    return handleRetranslate(msg.original, msg.style, tabId);
  }

  if (msg.action === "retranslateEntryWithNote") {
    return handleRetranslateWithNote(msg.original, msg.note, msg.currentTranslation, msg.styleId, tabId);
  }

  if (msg.action === "translateRegion") {
    (async () => {
      const hCount = getHist(tabId).length;
      const analysisEnabled = getAnalysisEnabled(tabId);
      const styleId = getStyleId(tabId);
      try {
        const ignoreSfx = getIgnoreSfx(tabId);
        await tell(tabId, { action: "showOverlay", imageUrl: msg.imageUrl, historyCount: hCount, analysisEnabled, styleId, ignoreSfx });
      } catch {
        await browser.tabs.executeScript(tabId, { file: "content.js" });
        const ignoreSfx = getIgnoreSfx(tabId);
        await tell(tabId, { action: "showOverlay", imageUrl: msg.imageUrl, historyCount: hCount, analysisEnabled, styleId, ignoreSfx });
      }
      try {
        const prev = tabState[tabId];
        const isSameImage = prev?.imageUrl === msg.imageUrl;
        const fullB64 = isSameImage && prev?.fullB64
          ? prev.fullB64
          : await imageToBase64Jpeg(msg.imageUrl, msg.pageUrl);
        const b64 = await cropAndEncode(msg.imageUrl, msg.crop, msg.pageUrl);
        tabState[tabId] = {
          b64,
          fullB64,
          imageUrl: msg.imageUrl,
          analysis: isSameImage ? (prev?.analysis || "") : "",
          analysisImageUrl: isSameImage ? prev?.analysisImageUrl || null : null,
          analysisEnabled,
          styleId,
          lastTranslation: prev?.lastTranslation || "",
          lastContextImageUrl: prev?.lastContextImageUrl || null,
          ignoreSfx: prev?.ignoreSfx || false
        };
        await streamTranslation(b64, tabId, false, fullB64);
      } catch (err) { tell(tabId, { action: "error", message: friendlyError(err) }); }
    })();
    return;
  }

  if (msg.action === "retry") {
    const state = tabState[tabId];
    if (!state) { tell(tabId, { action: "error", message: "No previous translation to retry." }); return; }
    (async () => {
      try { await streamTranslation(state.b64, tabId, true, state.fullB64 || state.b64); }
      catch (err) { tell(tabId, { action: "error", message: friendlyError(err) }); }
    })();
    return;
  }

  if (msg.action === "setAnalysisEnabled") {
    const enabled = !!msg.enabled;
    if (!tabState[tabId]) {
      tabState[tabId] = {
        b64: null,
        imageUrl: null,
        analysis: "",
        analysisEnabled: enabled,
        styleId: DEFAULT_STYLE,
        lastTranslation: "",
        fullB64: null,
        analysisImageUrl: null,
        lastContextImageUrl: null,
        ignoreSfx: false
      };
    }
    tabState[tabId].analysisEnabled = enabled;
    if (!enabled) tabState[tabId].analysis = "";
    return Promise.resolve({ analysisEnabled: enabled });
  }

  if (msg.action === "setStyle") {
    const styleId = STYLE_PROFILES[msg.styleId] ? msg.styleId : DEFAULT_STYLE;
    if (!tabState[tabId]) {
      tabState[tabId] = {
        b64: null,
        imageUrl: null,
        analysis: "",
        analysisEnabled: true,
        styleId,
        lastTranslation: "",
        fullB64: null,
        analysisImageUrl: null,
        lastContextImageUrl: null,
        ignoreSfx: false
      };
    }
    tabState[tabId].styleId = styleId;
    return Promise.resolve({ styleId });
  }

  if (msg.action === "setIgnoreSfx") {
    const ignoreSfx = !!msg.ignoreSfx;
    if (!tabState[tabId]) {
      tabState[tabId] = {
        b64: null,
        imageUrl: null,
        analysis: "",
        analysisEnabled: true,
        styleId: DEFAULT_STYLE,
        lastTranslation: "",
        fullB64: null,
        analysisImageUrl: null,
        lastContextImageUrl: null,
        ignoreSfx
      };
    } else {
      tabState[tabId].ignoreSfx = ignoreSfx;
    }
    return Promise.resolve({ ignoreSfx });
  }

  if (msg.action === "setGlobalInstructions") {
    globalInstructions = (msg.text || "").trim();
    return Promise.resolve({ ok: true });
  }

  if (msg.action === "setReadingOrder") {
    const order = msg.readingOrder || {};
    if (!tabState[tabId]) {
      tabState[tabId] = {
        b64: null,
        imageUrl: null,
        analysis: "",
        analysisEnabled: true,
        styleId: DEFAULT_STYLE,
        lastTranslation: "",
        fullB64: null,
        analysisImageUrl: null,
        lastContextImageUrl: null,
        ignoreSfx: false
      };
    }
    tabState[tabId].readingOrder = {
      auto: order.auto !== false,
      rtl: !!order.rtl,
      ttb: order.ttb !== false
    };
    return Promise.resolve({ readingOrder: tabState[tabId].readingOrder });
  }

  if (msg.action === "clearGlobalInstructions") {
    globalInstructions = "";
    return Promise.resolve({ ok: true });
  }

  if (msg.action === "getGlobals") {
    return Promise.resolve({
      globalInstructions,
      styleId: getStyleId(tabId),
      readingOrder: getReadingOrder(tabId),
      ignoreSfx: getIgnoreSfx(tabId)
    });
  }

  if (msg.action === "chat") {
    return handleChat(msg.text, tabId);
  }

  if (msg.action === "clearContext") {
    clearHist(tabId);
    delete storyRegistry[tabId];
    return Promise.resolve({ historyCount: 0 });
  }

  if (msg.action === "getHistoryCount") {
    return Promise.resolve({ historyCount: getHist(tabId).length });
  }
  if (msg.action === "getHistory") {
    return Promise.resolve({ history: getHist(tabId) });
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  delete tabState[tabId];
  delete pageHistory[tabId];
  delete storyRegistry[tabId];
});

// =================== SINGLE-ENTRY RETRANSLATION (text-only, 3 styles) ===================
async function handleRetranslate(original, style, tabId) {
  let sys;
  if (style === "literal")  sys = SYS_RETRANSLATE_LITERAL;
  else if (style === "natural") sys = SYS_RETRANSLATE_NATURAL;
  else sys = SYS_RETRANSLATE_STANDARD;

  const styleId = getStyleId(tabId);
  const stylePrompt = STYLE_PROFILES[styleId]?.prompt || "";

  const userParts = [];
  if (globalInstructions) userParts.push("GLOBAL INSTRUCTIONS:\n" + globalInstructions);
  if (stylePrompt) userParts.push("STYLE PROFILE:\n" + stylePrompt);
  userParts.push("Translate this:\n" + original);

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: sys },
        { role: "user",   content: userParts.join("\n\n") },
      ],
      max_tokens: 512,
      temperature: 0.15,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error("Server " + res.status);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || "";
  text = cleanOutput(text);
  return { translation: text };
}

// =================== SINGLE-ENTRY RETRANSLATION WITH NOTE ===================
async function handleRetranslateWithNote(original, note, currentTranslation, styleId, tabId) {
  const stylePrompt = STYLE_PROFILES[styleId]?.prompt || "";

  const sys =
`You are an expert translator for Japanese manga, including adult and explicit (18+) content.
Follow GLOBAL INSTRUCTIONS and the STYLE PROFILE in the user message.
Apply the LINE NOTE to improve only this single line.
Output ONLY the revised translated text, no labels.`;

  const parts = [];
  if (globalInstructions) parts.push("GLOBAL INSTRUCTIONS:\n" + globalInstructions);
  if (stylePrompt) parts.push("STYLE PROFILE:\n" + stylePrompt);
  parts.push("ORIGINAL:\n" + original);
  if (currentTranslation) parts.push("CURRENT TRANSLATION:\n" + currentTranslation);
  if (note) parts.push("LINE NOTE:\n" + note);
  parts.push("Output ONLY the revised translation:");

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: parts.join("\n\n") },
      ],
      max_tokens: 256,
      temperature: 0.2,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error("Server " + res.status);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || "";
  text = cleanOutput(text);

  // Decide if note should become global instruction
  if (note && note.trim().length > 0) {
    maybePromoteToGlobal(note, original, tabId).catch(() => {});
  }

  return { translation: text };
}

async function maybePromoteToGlobal(note, original, tabId) {
  const sys =
`You decide if a line-specific note should become a GLOBAL instruction for future pages.
If YES, output a single concise instruction line.
If NO, output exactly: NO`;

  const user =
`LINE NOTE:
${note}

ORIGINAL LINE:
${original}

Should this become a global instruction?`;

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      max_tokens: 80,
      temperature: 0.2,
      stream: false,
    }),
  });
  if (!res.ok) return;
  const data = await res.json();
  let out = data.choices?.[0]?.message?.content?.trim() || "";
  out = cleanOutput(out);
  if (!out || /^no$/i.test(out)) return;

  if (globalInstructions && !globalInstructions.includes(out)) {
    globalInstructions = (globalInstructions + "\n" + out).trim();
  } else if (!globalInstructions) {
    globalInstructions = out.trim();
  }

  if (tabId != null) {
    tell(tabId, { action: "globalInstructionUpdate", text: globalInstructions });
  }
}

// =================== SCENE ANALYSIS (stage 1 — non-streaming) ===================
async function analyseScene(base64Url, tabId) {
  const registry = tabId ? getRegistry(tabId) : "";
  const userText = registry
    ? "Previously established context:\n" + registry + "\n\nNow briefly analyse this manga/manhwa page. /no_think"
    : USER_ANALYSE;

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYS_ANALYSE },
        { role: "user", content: [
          { type: "image_url", image_url: { url: base64Url } },
          { type: "text", text: userText },
        ]},
      ],
      max_tokens: 300,
      temperature: 0.2,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error("Analysis failed: " + res.status);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || "";
  return cleanOutput(text);
}

// =================== HELPERS ===================
function tell(tabId, msg) { return browser.tabs.sendMessage(tabId, msg); }

async function fetchBlob(url, referer) {
  pendingReferer = referer || "";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Image download failed (" + res.status + ")");
    return await res.blob();
  } finally { pendingReferer = ""; }
}

function bitmapToJpeg(bmp, sx, sy, sw, sh) {
  let w = sw, h = sh;
  if (Math.max(w, h) > IMG_MAX_DIM) {
    const s = IMG_MAX_DIM / Math.max(w, h);
    w = Math.round(w * s); h = Math.round(h * s);
  }
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.95);
}

async function imageToBase64Jpeg(url, referer) {
  const blob = await fetchBlob(url, referer);
  const bmp = await createImageBitmap(blob);
  const r = bitmapToJpeg(bmp, 0, 0, bmp.width, bmp.height);
  bmp.close(); return r;
}

async function cropAndEncode(url, crop, referer) {
  const blob = await fetchBlob(url, referer);
  const bmp = await createImageBitmap(blob);
  const sx = Math.round(crop.x * bmp.width);
  const sy = Math.round(crop.y * bmp.height);
  const sw = Math.max(1, Math.round(crop.w * bmp.width));
  const sh = Math.max(1, Math.round(crop.h * bmp.height));
  const r = bitmapToJpeg(bmp, sx, sy, sw, sh);
  bmp.close(); return r;
}

function stripThink(t) {
  t = t.replace(/<think>[\s\S]*?<\/think>/g, "");
  t = t.replace(/<think>[\s\S]*$/g, "");
  return t.trim();
}

function cleanOutput(t) {
  t = stripThink(t);
  t = t.replace(/\s*\/no_think\s*/gi, "");
  t = t.replace(/^["「」]+|["「」]+$/g, "").trim();
  return t;
}

function friendlyError(err) {
  const m = err.message || String(err);
  if (/fetch|network/i.test(m)) return "Cannot reach llama.cpp at " + LLAMA_SERVER + ".\nMake sure the server is running.";
  if (/decode|bitmap/i.test(m)) return "Could not decode image. The format may be unsupported.";
  return m;
}

function detectLoop(text) {
  const blocks = text.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  if (blocks.length < LOOP_THRESHOLD) return false;
  const last = blocks.slice(-LOOP_THRESHOLD);
  return last.every(b => b === last[0]);
}

function dedupeOutput(text) {
  const blocks = text.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  const seen = new Set(); const unique = [];
  for (const b of blocks) { if (seen.has(b)) continue; seen.add(b); unique.push(b); }
  return unique.join("\n\n");
}

// =================== BUILD HISTORY CONTEXT FOR PROMPT ===================
function detectReadingOrder(analysisText) {
  if (!analysisText) return null;
  const t = analysisText.toLowerCase();
  if (/\bkorean\b/.test(t) || /\bmanhwa\b/.test(t))
    return "LEFT to RIGHT — this is Korean manhwa";
  if (/\bchinese\b/.test(t) || /\bmanhua\b/.test(t)) {
    if (/\btraditional\b/.test(t) && /\bvertical\b/.test(t))
      return "RIGHT to LEFT — this is traditional Chinese manhua with vertical text";
    return "LEFT to RIGHT — this is Chinese manhua";
  }
  if (/\bjapanese\b/.test(t) || /\bmanga\b/.test(t))
    return "RIGHT to LEFT — this is Japanese manga";
  if (/left.to.right/i.test(t) || /\bltr\b/.test(t)) return "LEFT to RIGHT";
  if (/right.to.left/i.test(t) || /\brtl\b/.test(t)) return "RIGHT to LEFT";
  return null;
}
function buildHistoryPrefix(tabId) {
  const registry = getRegistry(tabId);
  const hist = getHist(tabId);
  const lastPage = hist.length ? hist[hist.length - 1] : "";

  let prefix = "";
  if (registry) {
    prefix += "=== STORY REGISTRY ===\n" + registry + "\n\n";
  }
  if (lastPage) {
    prefix += "=== PREVIOUS PAGE ===\n" + lastPage + "\n\n";
  }
  return prefix;
}

function buildStyleBlock(tabId) {
  const styleId = getStyleId(tabId);
  const style = STYLE_PROFILES[styleId];
  return style ? "STYLE PROFILE:\n" + style.prompt : "";
}

// =================== STREAMING TRANSLATION (analysis → translate) ===================
async function streamTranslation(base64Url, tabId, isRetry, analysisBase64Url) {

  // —— Stage 1: Scene analysis ——
  let analysis = "";
  const analysisEnabled = getAnalysisEnabled(tabId);
  const state = tabState[tabId];
  const currentImageUrl = state?.imageUrl || null;
  const analysisImageUrl = state?.analysisImageUrl || null;
  const analysisSource = analysisBase64Url || base64Url;

  if (analysisEnabled) {
    if ((isRetry && state?.analysis) || (analysisImageUrl && analysisImageUrl === currentImageUrl && state?.analysis)) {
      analysis = state.analysis;
      tell(tabId, { action: "analysis", text: analysis });
    } else {
      try {
        analysis = await analyseScene(analysisSource, tabId);
        tell(tabId, { action: "analysis", text: analysis });
      } catch {
        tell(tabId, { action: "analysis", text: "" });
      }
    }
  } else {
    tell(tabId, { action: "analysis", text: "" });
  }

  if (tabState[tabId]) {
    tabState[tabId].analysis = analysis;
    if (analysis) tabState[tabId].analysisImageUrl = currentImageUrl;
  }

  // —— Stage 2: Translation (streaming) ——
  const readingOrder = getReadingOrder(tabId);
  const autoOrder = readingOrder?.auto !== false;
  const detectedOrder = autoOrder ? detectReadingOrder(analysis) : null;
  let orderDirective = "";
  if (!autoOrder) {
    const dir = readingOrder?.rtl ? "RIGHT to LEFT" : "LEFT to RIGHT";
    const vertical = readingOrder?.ttb === false ? "bottom to top" : "top to bottom";
    orderDirective =
      "⚠️ READING ORDER: " + dir + ", " + vertical +
      ". You MUST translate text entries in this order across the page.";
    if (dir.includes("LEFT to RIGHT")) {
      orderDirective += " Do NOT use right-to-left manga order.\n\n";
    } else {
      orderDirective += " Do NOT use left-to-right manhwa order.\n\n";
    }
  } else if (detectedOrder) {
    orderDirective =
      "⚠️ READING ORDER: " + detectedOrder +
      ". You MUST translate text entries in this order across the page, top to bottom." +
      (detectedOrder.includes("LEFT to RIGHT")
        ? " Do NOT use right-to-left manga order.\n\n"
        : " Do NOT use left-to-right manhwa order.\n\n");
  }

  const histPrefix = buildHistoryPrefix(tabId);
  const parts = [];
  if (globalInstructions) parts.push("GLOBAL INSTRUCTIONS:\n" + globalInstructions);
  if (getIgnoreSfx(tabId)) {
    parts.push("SFX FILTER:\nDo NOT output any entries in the [SFX] category. Skip sound effects entirely.");
  }
  const styleBlock = buildStyleBlock(tabId);
  if (styleBlock) parts.push(styleBlock);
  if (histPrefix) parts.push(histPrefix);
  if (analysis)   parts.push("Scene analysis for this page:\n" + analysis);

  const contextBlock = parts.length ? parts.join("\n\n") + "\n\n" : "";
  const userText = contextBlock + orderDirective + (isRetry ? USER_RETRY : USER_NORMAL);

  const payload = {
    messages: [
      { role: "system", content: isRetry ? SYS_RETRY : SYS_NORMAL },
      { role: "user", content: [
        { type: "image_url", image_url: { url: base64Url } },
        { type: "text", text: userText },
      ]},
    ],
    max_tokens: MAX_TOKENS, temperature: isRetry ? RETRY_TEMP : TEMPERATURE,
    stream: true,
    repeat_penalty: REPEAT_PENALTY, repeat_last_n: REPEAT_LAST_N,
    frequency_penalty: FREQUENCY_PENALTY, presence_penalty: PRESENCE_PENALTY,
    dry_multiplier: DRY_MULTIPLIER, dry_base: DRY_BASE,
    dry_allowed_length: DRY_ALLOWED_LENGTH, dry_penalty_last_n: DRY_PENALTY_LAST_N,
  };

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error("Server " + res.status + ": " + res.statusText + "\n" + body);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "", buf = "", aborted = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) {
      const tr = line.trim();
      if (!tr.startsWith("data: ")) continue;
      const d = tr.slice(6);
      if (d === "[DONE]") break;
      try {
        const j = JSON.parse(d);
        const c = j.choices?.[0]?.delta?.content ?? "";
        if (c) {
          full += c;
          const clean = stripThink(full);
          if (clean && detectLoop(clean)) { aborted = true; reader.cancel(); break; }
          if (clean) tell(tabId, { action: "chunk", text: clean });
        }
      } catch {}
    }
    if (aborted) break;
  }

  let final = stripThink(full);
  final = final.replace(/\s*\/no_think\s*/gi, "");
  final = dedupeOutput(final) || "No translatable text found.";
  if (getIgnoreSfx(tabId)) {
    final = filterSfxBlocks(final);
  }

  // Save last translation for chat context
  if (tabState[tabId]) tabState[tabId].lastTranslation = final;

  // —— Save to page history (analysis + translation) ——
  const histEntry = filterForContext(final, analysis);
  const isNewContextImage = state?.lastContextImageUrl !== currentImageUrl;
  let didUpdateContext = false;
  if (isRetry) {
    if (state?.lastContextImageUrl === currentImageUrl) {
      replaceLastHist(tabId, histEntry);
      didUpdateContext = true;
    } else {
      pushHist(tabId, histEntry);
      didUpdateContext = true;
    }
  } else if (isNewContextImage) {
    pushHist(tabId, histEntry);
    didUpdateContext = true;
  }

  if (didUpdateContext && tabState[tabId]) {
    tabState[tabId].lastContextImageUrl = currentImageUrl;
  }

  // —— Update story registry in background ——
  if (didUpdateContext) {
    updateStoryRegistry(tabId, analysis, histEntry);
  }

  // —— Quality check (async) ——
  qualityCheck(final, tabId).catch(() => {});

  tell(tabId, { action: "done", text: final, historyCount: getHist(tabId).length });
}

// =================== QUALITY CHECK ===================
function parseBlocksForQA(text) {
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

async function qualityCheck(text, tabId) {
  const blocks = parseBlocksForQA(text);
  if (!blocks.length) return;

  const list = blocks.map((b, i) =>
    `#${i}\nORIGINAL: ${b.orig}\nTRANSLATION: ${b.trans}`
  ).join("\n\n");

  const sys =
`You are a strict translation QA assistant.
Find any entries likely incorrect, inconsistent, or low-confidence.
Return a JSON array of objects: [{ "index": number, "reason": "short reason" }]
If all entries look fine, return [].
Return ONLY JSON.`;

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: list }
      ],
      temperature: 0.2,
      max_tokens: 300,
      stream: false
    })
  });
  if (!res.ok) return;
  const data = await res.json();
  let out = data.choices?.[0]?.message?.content?.trim() || "";
  out = cleanOutput(out);

  let items;
  try { items = JSON.parse(out); } catch { return; }
  if (!Array.isArray(items)) return;

  tell(tabId, { action: "quality", items });
}

// =================== CHAT (text-only) ===================
async function handleChat(text, tabId) {
  const registry = getRegistry(tabId);
  const hist = getHist(tabId);
  const lastPage = hist.length ? hist[hist.length - 1] : "";
  const lastTranslation = tabState[tabId]?.lastTranslation || "";

  const parts = [];
  if (globalInstructions) parts.push("GLOBAL INSTRUCTIONS:\n" + globalInstructions);
  if (registry) parts.push("STORY REGISTRY:\n" + registry);
  if (lastPage) parts.push("PREVIOUS PAGE:\n" + lastPage);
  if (lastTranslation) parts.push("LAST TRANSLATION (raw):\n" + lastTranslation);

  const sys =
`You are a helpful translation assistant for adult manga.
Respond clearly and concisely. If the user gives context, integrate it.`;

  const user = (parts.length ? parts.join("\n\n") + "\n\n" : "") + "USER MESSAGE:\n" + text;

  const res = await fetch(LLAMA_SERVER + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      temperature: 0.3,
      max_tokens: 400,
      stream: false
    })
  });
  if (!res.ok) throw new Error("Server " + res.status);
  const data = await res.json();
  let reply = data.choices?.[0]?.message?.content || "";
  reply = cleanOutput(reply);
  return { reply };
}
