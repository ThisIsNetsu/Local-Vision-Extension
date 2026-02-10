# AGENTS.md

## What this repo is
VisionTranslate is a Firefox Manifest V2 extension that translates text inside selected image regions using a local `llama.cpp` vision endpoint.

### High-level architecture
- `manifest.json`: declares MV2 background/content scripts and required permissions.
- `background.js`: owns the translation pipeline, prompt construction, LLM calls/stream handling, context memory, retroactive context updates, and persisted settings.
- `content.js`: owns in-page UI (region selection, overlay rendering, settings modal, line actions) and user interaction handling.
- Options/settings UI is implemented inside the content overlay modal (there is no separate options page file).

## Working agreements
- Make minimal, targeted changes for the requested task.
- Do **not** refactor unrelated areas.
- Do **not** add or broaden permissions unless strictly required.
- Preserve existing user workflows and message/action contracts between background/content.
- Keep naming/style consistent with nearby code.

## LLM guardrails
- For edit-plan style outputs, require strict JSON-only responses with explicit schema.
- Reject/ignore non-JSON plan output instead of trying to "fix" freeform text.
- Avoid duplicate extracted/translated entries.
- Full-image analysis must remain exhaustive: scan the entire crop/page, including small/background/edge text and SFX.

## Storage and persistence
- Persist cross-tab/cross-restart settings/state with `browser.storage.local`.
- Do not introduce transient-only storage for data that users expect to survive reload/restart.

## UI interaction rules
- Text inputs intended for submit-on-enter should use:
  - `Enter` = submit and blur (no newline insertion)
  - `Esc` = cancel/close current interaction
- Preserve existing keyboard behavior in overlay, notes, and region-selection flows.

## Concurrency and request flow
- LLM work must be serialized/debounced per tab to avoid overlapping runs and stale writes.
- Reuse existing queue/debounce mechanisms for per-tab retroactive/context updates.
- Do not introduce global blocking that couples independent tabs.

## Validation
- Prefer lightweight validation aligned to existing project workflow.
- If unsure about test commands, state: **"No automated tests configured."**
