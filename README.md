# VibeUsage

Chrome extension to monitor Claude and ChatGPT API usage limits at a glance.

## Why

On macOS, CLI tools that read Chrome cookies trigger Keychain password prompts. This extension runs inside Chrome, using its own cookies natively — no password prompts, no `browser_cookie3`.

## Install

1. Clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the repo directory
5. Pin the extension for quick access

## Usage

Click the extension icon to see usage for both providers. Data refreshes automatically on popup open, or click the refresh button.

## Requirements

- Logged in to [claude.ai](https://claude.ai) for Claude usage
- Logged in to [chatgpt.com](https://chatgpt.com) for ChatGPT usage

## License

MIT
