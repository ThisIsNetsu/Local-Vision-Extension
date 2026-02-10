# Troubleshooting

## 1) "Cannot reach llama.cpp ..."
- Trigger path: network/fetch failures are mapped to this friendly error string. Source: `background.js` (`friendlyError`).
- Check current server URL in settings (`LLAMA_SERVER`) and save. Source: `content.js` (`openSettingsModal`), `background.js` (`setSettings`).

## 2) Image decode/download failures
- Download failures throw `Image download failed (status)` while fetching source image. Source: `background.js` (`fetchBlob`).
- Decode failures are surfaced as unsupported image format hints. Source: `background.js` (`friendlyError`, `imageToBase64Jpeg`, `cropAndEncode`).
- Some hosts require referer; extension temporarily injects referer for tabless fetches. Source: `background.js` (`pendingReferer`, `browser.webRequest.onBeforeSendHeaders`).

## 3) "No previous translation to retry"
- Happens when retry is clicked before any successful translation state exists for that tab. Source: `background.js` (`retry` branch in `browser.runtime.onMessage`).

## 4) Context quality drift over time
- Mitigations already in code: compact latest entry, retroactive edit-plan queue, sanity checks against runaway growth/repetition/markers. Source: `background.js` (`compactLatestHistoryEntry`, `queueRetroactiveUpdate`, `isHistoryEntrySane`).
- If behavior still drifts, toggle `RETROACTIVE_CONTEXT` in settings and compare outputs. Source: `content.js` (`openSettingsModal`), `background.js` (`settings.RETROACTIVE_CONTEXT`).
