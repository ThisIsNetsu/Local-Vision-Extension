# Architecture

## Component map
- **Manifest wiring**: MV2 background script + content script on all URLs. Source: `manifest.json` (top-level `background`, `content_scripts`, `permissions`).
- **Background (`background.js`)**: orchestration, llama.cpp requests, history/registry/QA, settings persistence, message contract hub. Source: `background.js` (`browser.runtime.onMessage`, `streamTranslation`, `updateStoryRegistry`, `qualityCheck`).
- **Content (`content.js`)**: DOM UI/overlay, region selection, user interactions, rendering streamed output. Source: `content.js` (`showOverlay`, `startSel`, `render`, `browser.runtime.onMessage`).

```mermaid
flowchart LR
  U[User on web page] --> C[content.js\nOverlay + region selector]
  C -->|runtime.sendMessage| B[background.js\nPipeline + state]
  B -->|fetch /v1/chat/completions| L[Local llama.cpp server]
  B -->|tabs.sendMessage chunk/done/analysis| C
  B -->|browser.storage.local| S[(settings)]
```

## Translation request lifecycle

```mermaid
sequenceDiagram
  participant User
  participant Content as content.js
  participant Background as background.js
  participant LLM as llama.cpp

  User->>Content: Right-click image + draw crop
  Content->>Background: translateRegion(imageUrl, crop, pageUrl)
  Background->>Background: cropAndEncode + tabState update
  alt analysis enabled
    Background->>LLM: analyseScene(full image)
    LLM-->>Background: analysis text
    Background-->>Content: action: analysis
  end
  Background->>LLM: streamTranslation(crop image + context)
  loop stream chunks
    LLM-->>Background: SSE delta
    Background-->>Content: action: chunk
  end
  Background->>Background: dedupe/filter/history/registry/QA
  Background-->>Content: action: done (+ historyCount)
  Background-->>Content: action: quality (async)
```

## Concurrency + state boundaries
- Per-tab isolation comes from `tabState[tabId]`, `pageHistory[tabId]`, and `storyRegistry[tabId]`. Source: `background.js` (`tabState`, `pageHistory`, `storyRegistry`, `browser.tabs.onRemoved`).
- Retroactive context updates are queued per tab (`Map` + in-flight `Set`) to prevent overlapping writes for that tab. Source: `background.js` (`retroactiveQueue`, `retroactiveInFlight`, `queueRetroactiveUpdate`).
- TODO: confirm whether translation runs themselves are intentionally non-serialized per tab (no explicit in-flight guard in `streamTranslation` call sites). Source: `background.js` (`translateRegion`/`retry` branches call `streamTranslation` directly).
