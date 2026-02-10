# VisionTranslate Overview

## What this extension currently does
- Adds an image context-menu action (`🔍 Select & Translate Region`) and asks the content script to start region selection. Source: `background.js` (`browser.contextMenus.create`, `browser.contextMenus.onClicked`).
- Lets users draw a crop region over an image, then sends `{ action: "translateRegion", imageUrl, crop, pageUrl }` to background. Source: `content.js` (`startSel`, `findImageRect`).
- Runs translation in two stages: scene analysis (optional per tab) then streaming translation for the selected crop. Source: `background.js` (`streamTranslation`, `analyseScene`).
- Streams partial output into the overlay, then finalizes with de-duplication and optional SFX filtering. Source: `background.js` (`streamTranslation`, `dedupeOutput`, `filterSfxBlocks`), `content.js` (`browser.runtime.onMessage` handling `chunk`/`done`).
- Supports per-line retranslation (Standard/Literal/Natural) and note-driven retranslation for single entries. Source: `content.js` (`onCtx`, `doRetranslate`), `background.js` (`handleRetranslate`, `handleRetranslateWithNote`).

## Key runtime state model (today)
- **Per-tab transient state**: active image/crop base64, analysis text, style/flags, last translation, notes. Source: `background.js` (`tabState`, `ensureTabState`, `translateRegion` branch in `browser.runtime.onMessage`).
- **Per-tab context memory**: rolling page history (`MAX_HISTORY = 10`) + compact story registry. Source: `background.js` (`pageHistory`, `pushHist`, `storyRegistry`, `updateStoryRegistry`).
- **Persisted settings**: loaded from and saved to `browser.storage.local.settings`. Source: `background.js` (`loadSettings`, `setSettings`, `resetSettings`).
- **Global instructions**: in-memory string shared across tabs until browser restart. Source: `background.js` (`globalInstructions`, `setGlobalInstructions`, `clearGlobalInstructions`).

## User-visible controls currently wired
- Overlay controls: retry, style select, analysis toggle, context viewer badge, settings modal, global instructions box. Source: `content.js` (`showOverlay`, `openCtxViewer`, `openSettingsModal`).
- Reading-order controls: auto/manual direction settings sent to background. Source: `content.js` (`syncReadingOrder` inside `showOverlay`), `background.js` (`setReadingOrder`, `buildManualOrderDirective`, `detectReadingOrder`).
- Text chat panel: sends `addUserNote` and `chat`. Source: `content.js` (`sendChat`), `background.js` (`handleChat`, `addUserNote`).

## Known unknowns
- TODO: confirm intended lifetime of `globalInstructions` (currently process-memory only; not persisted). Source: `background.js` (`globalInstructions`, no storage writes for this key).
