# VisionTranslate (Local Vision Extension)

VisionTranslate is a Firefox extension that translates text found inside images (such as manga, manhwa, and manhua pages) by sending a selected image region to a local `llama.cpp` vision model server. It adds a context-menu option to select a region, renders an overlay with translations, and includes tools to refine and re-run translations without leaving the page.

> Status: Alpha. The project is under active development and behavior may change between updates.

## What it does

- Captures a user-selected region of an image and submits it to a local vision-capable model server.
- Runs a two-stage pipeline (scene analysis → translation) to improve reading order and consistency.
- Displays results in an on-page overlay with per-line controls, quality checks, and context memory.

## Features

- **Region selection**: draw a rectangle over any image area to translate only that portion.
- **Translation overlay**: categorized output (Dialogue, Narration, SFX, Sign, Text) with streaming updates.
- **Retranslation tools**:
  - Right-click a line for Standard / Literal / Natural retranslation.
  - Add per-line notes that automatically trigger retranslation.
- **Context memory**: per-tab history and a compact story registry to keep names consistent.
- **Global instructions**: apply style/constraints across all tabs until restart.
- **Quality check**: highlights low-confidence entries in the UI.
- **Text-only chat**: ask questions or provide additional context to the model.

## Requirements

- **Browser**: Firefox (Manifest V2 with `browser.*` APIs).
  - Chromium-based browsers will require MV3 migration and a polyfill.
- **Local model server**: `llama.cpp` running on `http://127.0.0.1:8033` with a vision-capable model (the prompts are optimized for Qwen3-VL style models).

### llama.cpp server expectations

The extension sends OpenAI-style `/v1/chat/completions` requests that include `image_url` content. Ensure your server:

- Accepts `image_url` messages for vision input.
- Supports streaming (`stream: true`).
- Exposes the endpoint at `http://127.0.0.1:8033` (or update the configuration).

## Quick start (development)

1. Clone or copy this repository.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file in this repo.

## Usage

1. Navigate to a page containing an image.
2. Right-click the image and choose **🔍 Select & Translate Region**.
3. Draw a rectangle around the text you want translated.
4. Review the translation in the overlay and adjust as needed.

### Overlay controls

- **Analysis toggle**: enable/disable scene analysis.
- **Retry**: re-run translation if text was missed.
- **Style dropdown**: choose a style profile (Explicit, Literal, Localized, Erotic, Crude).
- **Global instructions**: apply instructions across all tabs until restart.
- **Context badge**: view stored page context and history.

### Per-line actions

- Right-click a translated line for Standard / Literal / Natural retranslation.
- Add a note to a line to auto-retranslate with the note applied.

## Configuration

Key settings live near the top of `background.js`:

- `LLAMA_SERVER`: server URL (default `http://127.0.0.1:8033`).
- `TARGET_LANG`: output language (default `English`).
- `MAX_TOKENS`, `TEMPERATURE`, penalties: model tuning values.
- `IMG_MAX_DIM`: max size for image preprocessing.

You can also edit prompt text and style profiles inside `background.js`.

## Permissions

The extension requests:

- `contextMenus` (to add translation options in right-click menus)
- `activeTab`
- `webRequest` and `webRequestBlocking` on `<all_urls>` (used to inject a Referer header when fetching images)

## Limitations

- Manifest V2 is deprecated in Chromium; Firefox still supports it.
- The extension assumes a local `llama.cpp` server is running with a vision model.
- Some sites block cross-origin image fetching; translations may fail if the image is not accessible.

## Troubleshooting

- **Cannot reach llama.cpp**: Start your server and confirm it listens on `127.0.0.1:8033`.
- **Blank or missing translations**: Use **Retry** or check server logs for model errors.
- **Region translate does nothing**: Confirm the image is accessible and not blocked by CSP/hotlinking.

## Project structure

- `manifest.json` – extension manifest and permissions.
- `background.js` – translation pipeline, API calls, context/history, QA, and chat.
- `content.js` – overlay UI, region selection, per-line tools, and rendering.

## License

No license file is included in this repository.
