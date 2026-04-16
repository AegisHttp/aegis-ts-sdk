# Aegis Http SDK

![Version](https://img.shields.io/npm/v/aegis-ts-sdk)
![License](https://img.shields.io/npm/l/aegis-ts-sdk)

The **Aegis Http SDK** is the official JavaScript/TypeScript client library for the [Aegis Http Zero Trust ecosystem](https://github.com/AegisHttp). It enables web applications (Vanilla JS, Vue, React, Angular, etc.) to securely negotiate end-to-end (E2E) PGP encryption with any Aegis Http-compliant Caddy/GoFiber/Laravel backend, **seamlessly**.

This SDK handles the complex interactions with the [Aegis Web Extension](https://github.com/AegisHttp) without requiring the developer to manage any PGP keys, WebCrypto APIs, or cryptographic handshakes manually.

## 📦 Installation

Install the package via your preferred package manager:

```bash
npm install aegis-http-sdk
```

Or consume it directly in your HTML over a CDN (like Unpkg/jsDelivr) once it's published.

## 🚀 Quick Start

Zero Trust authentication with Aegis requires only **two** steps: initialize the configuration, and invoke the mutual authentication challenge. Once authenticated, your standard `fetch` or `axios` calls are autonomously protected by the Aegis Extension.

```javascript
import "aegis-http-sdk";

// 1. Initialize the SDK
window.aegis.init();

// 2. Wrap your login button logic
document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    // Automatically triggers the Browser Extension to sign the Server's Challenge securely using OS Keyring
    const userEmail = await window.aegis.login();
    console.log("Zero Trust authentication successful for: " + userEmail);
  } catch (error) {
    console.error("GPG Handshake failed:", error);
  }
});
```

_(If the user does not have the browser extension installed, `.login()` will gracefully throw an error and present a minimalist, built-in dialog guiding them to the extension stores)._

## 🔌 Transparent Tunneling (Zero-Metadata)

By default, the Aegis architecture only encrypts `POST/PUT` payloads.
If your backend routing architecture supports full **transparent tunneling** (e.g. using the Aegis Http Caddy Module), you can force all your web application's requests—including `GET/DELETE/OPTIONS`, parameters, and HTTP Headers like `Authorization`—to be completely encrypted into a singular opaque HTTP envelope.

```javascript
// Force all URLs, Methods, and Headers to be encrypted into POST bodies
window.aegis.init({ forceTunneling: true });
```

Once `forceTunneling` is enabled, the browser extension will intercept all standard network requests on the page, encrypting their full metadata. Neither proxies nor middle-boxes will be able to parse your REST endpoints (`?id=X`) or tokens.

## ⚙️ Advanced Configuration

If your backend exposes the authentication challenge/login verification at non-standard endpoints, you can safely remap them:

```javascript
window.aegis.init({
  challengeUrl: "/api/secret-challenge", // Default: /api/challenge
  loginUrl: "/api/verify-signature", // Default: /api/login
  forceTunneling: false, // Default: false
});
```

## How It Works Under The Hood

1. **`window.aegis.login()`**: Makes a `GET` request to `/api/challenge` requesting a strict one-time cryptographic phrase.
2. Passes the phrase to the OS-Level GPG binary securely through the injected browser Native Host interface.
3. Submits the signed phrase back to the server at `/api/login` via `POST`.
4. If the server successfully verifies the cryptographic signature (e.g., using WKD keyserver matching), session metadata is cached.

Your backend and your frontend are now permanently encrypted End-to-End until the session token expires.

## 🏢 Backend Infrastructure

This SDK is the **frontend** component of the architecture. For it to work, your backend must be able to natively decrypt the AES-GPG cipher payloads.

We provide plug-and-play middleware and reverse proxy modules for various infrastructures. Please visit our official organization to explore backend integrations:
👉 **[github.com/aegishttp](https://github.com/aegishttp)**

Supported Backend Architectures:

- **Caddy Web Server Module** _(Use Aegis in front of any Node.js, Python, or Ruby backend instantly)_
- **GoFiber Middleware** _(High-performance native Go implementation)_
- **Laravel Middleware** _(Native PHP implementation)_

## ⚖️ License

Licensed under **AGPL-3.0**. Read the main repository for comprehensive deployment topologies and security vulnerability mitigations.
