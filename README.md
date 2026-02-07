# VisionTranslate (Local Vision Extension)

VisionTranslate is a Manifest V2 browser extension that translates text inside images (manga/manhwa/manhua pages) using a local **llama.cpp** server and a vision-language model (e.g., Qwen3-VL). The extension adds right-click context menu actions to translate a full image or a selected region, then renders a translation overlay with tools for retranslation, notes, and context continuity.

## Key Features

- **Image translation overlay** with categorized output (Dialogue, Narration, SFX, Sign, Text) and streaming updates.
- **Two-stage pipeline**: scene analysis → translation to improve reading order and consistency.
- **Region selection**: draw a rectangle over part of an image to translate just that area.
- **Context memory**: per-tab history for the last few pages and a compact story registry to keep character names consistent.
- **Retranslation tools**:
  - Right-click any translated line for Standard / Literal / Natural retranslation.
  - Add per-line notes that auto-trigger retranslation with the note applied.
- **Global instructions** (apply across all tabs until restart).
- **Quality check** pass that flags low-confidence entries in the UI.
- **Text-only chat** to ask questions or provide context to the model.

## Requirements

- **Browser**: Firefox (Manifest V2 + `browser.*` API). Chromium-based browsers may require a polyfill and MV3 migration.
- **Local model server**: `llama.cpp` running at `http://127.0.0.1:8033` with a vision-capable model (the extension is written for Qwen3-VL style prompts).

### llama.cpp server expectations
The extension sends OpenAI-style `/v1/chat/completions` requests with `image_url` content. Ensure your server:

- Accepts `image_url` messages for vision input.
- Supports streaming (`stream: true`).
- Exposes the endpoint at `http://127.0.0.1:8033`.

## Installation (Development)

1. Clone or copy this repo to your machine.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file in this repo.

## Usage

1. **Navigate** to a page with an image (e.g., a manga page).
2. **Right-click the image** and choose one of:
   - **🌐 Translate Image Text** (full image)
   - **🔍 Select & Translate Region** (draw a rectangle)
3. The overlay will open and start translating.

### Overlay Controls

- **Analysis toggle**: enable/disable scene analysis.
- **Retry**: re-run translation if text was missed.
- **Style dropdown**: choose a style profile (Explicit, Literal, Localized, Erotic, Crude).
- **Global instructions**: apply instructions across all tabs until restart.
- **Context badge**: view stored page context and history.

### Per-line Actions

- **Right-click a translated line** for Standard / Literal / Natural retranslation.
- **Line note**: type a note on a line to auto-retranslate with the note applied.

### Region Translate

Choose **Select & Translate Region**, then drag a rectangle over the area you want translated. The crop is applied relative to the source image so the model only sees the selected region.

## Configuration

Important configuration values are at the top of `background.js`:

- `LLAMA_SERVER`: server URL (default `http://127.0.0.1:8033`).
- `TARGET_LANG`: output language (default `English`).
- `MAX_TOKENS`, `TEMPERATURE`, penalties: tuning for the model.
- `IMG_MAX_DIM`: max size for image preprocessing.

You can also adjust prompt text and style profiles inside `background.js`.

## Permissions

The extension requests:

- `contextMenus` (to add translation options in right-click menus)
- `activeTab`
- `webRequest` and `webRequestBlocking` on `<all_urls>` (used to inject a Referer header when fetching images)

## Limitations

- **Manifest V2** is deprecated in Chromium. Firefox still supports MV2.
- The extension assumes a local llama.cpp server is running with a vision model.
- Image sites that block cross-origin image fetching may still fail, even with Referer injection.

## Troubleshooting

- **“Cannot reach llama.cpp”**: Start your server and ensure it listens on `127.0.0.1:8033`.
- **Blank or no translation**: Use **Retry** or check the server logs for model errors.
- **Region translate does nothing**: ensure the page image is accessible and not blocked by CSP/hotlinking.

## Project Structure

- `manifest.json` – extension manifest and permissions.
- `background.js` – translation pipeline, llama.cpp API calls, context/history, QA, and chat.
- `content.js` – overlay UI, region selection, per-line tools, and rendering.

## License

No license file is included in this repository.
