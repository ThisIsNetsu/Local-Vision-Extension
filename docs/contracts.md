# Contracts (Current + Intended Invariants)

## A) Non-negotiable behavioral rules

### Current behavior (as implemented)
1. **Region translation is message-driven**: content must send `translateRegion`; background owns crop encode + pipeline execution. Source: `content.js` (`startSel`), `background.js` (`browser.runtime.onMessage` -> `translateRegion`).
2. **Pipeline order is analysis-before-translation** when analysis is enabled. Source: `background.js` (`streamTranslation`).
3. **Streaming output is sanitized**: strips `<think>`, removes `/no_think`, dedupes repeated blocks, optional SFX filtering if enabled. Source: `background.js` (`stripThink`, `cleanOutput`, `dedupeOutput`, `filterSfxBlocks`, `streamTranslation`).
4. **History updates are image-aware**: retry may replace last entry for same image; new image pushes a new entry; history capped to 10 entries. Source: `background.js` (`replaceLastHist`, `pushHist`, `MAX_HISTORY`, `streamTranslation`).
5. **Retroactive edits require strict JSON plan and safe application**; invalid/non-JSON is ignored. Source: `background.js` (`requestRetroactiveEditPlan`, `applyRetroactiveEditPlan`, `isHistoryEntrySane`, `retroactivelyUpdateHistory`).
6. **Per-line note behavior**: Enter (without Shift) blurs/submits note path; line note changes debounce and can trigger retranslation + note persistence. Source: `content.js` (note input handlers in `render`), `background.js` (`retranslateEntryWithNote`, `addUserNote`).
7. **Region-selection cancel uses Escape**. Source: `content.js` (`bindOverlayKeys`, `startSel`).

### Intended invariants (should not be broken)
- Keep background/content message actions backward compatible for existing UI flows. Source locations to verify: `background.js` (`browser.runtime.onMessage`) and `content.js` (`browser.runtime.onMessage`).
- Do not broaden extension permissions unless strictly required. Source baseline: `manifest.json` (`permissions`).
- LLM edit plans for retroactive context remain strict JSON-only and are ignored if malformed. Source: `background.js` (`requestRetroactiveEditPlan`).
- Avoid duplicate translated entries in final output. Source: `background.js` (`dedupeOutput`).

## B) Storage schema

### Persisted (`browser.storage.local`)
Stored key: `settings` object. Source: `background.js` (`loadSettings`, `setSettings`, `resetSettings`).

Current normalized fields (with defaults in `DEFAULT_SETTINGS`):
- `LLAMA_SERVER` (string)
- `TARGET_LANG` (string)
- `MAX_TOKENS` (number)
- `TEMPERATURE` (number)
- `RETRY_TEMP` (number)
- `IMG_MAX_DIM` (number)
- `REPEAT_PENALTY` (number)
- `REPEAT_LAST_N` (number)
- `FREQUENCY_PENALTY` (number)
- `PRESENCE_PENALTY` (number)
- `DRY_MULTIPLIER` (number)
- `DRY_BASE` (number)
- `DRY_ALLOWED_LENGTH` (number)
- `DRY_PENALTY_LAST_N` (number)
- `LOOP_THRESHOLD` (number)
- `RETROACTIVE_CONTEXT` (boolean)
Source: `background.js` (`DEFAULT_SETTINGS`, `normalizeSettings`), UI exposure in `content.js` (`openSettingsModal`).

### In-memory only (per current code)
- `globalInstructions` (cross-tab until restart). Source: `background.js` (`globalInstructions`, `setGlobalInstructions`/`clearGlobalInstructions`).
- `tabState[tabId]`, `pageHistory[tabId]`, `storyRegistry[tabId]`. Source: `background.js` (same-named objects + `browser.tabs.onRemoved`).
- TODO: confirm whether any of these should be persisted across restart (currently they are not).
