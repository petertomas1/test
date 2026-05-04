# 🔐 Signal Chat Desktop

<div align="center">
  <img src="./assets/icon.svg" width="120" alt="Signal Chat icon" />
  <p><strong>Production-style WhatsApp-inspired secure chat starter</strong><br/>FastAPI + WebSocket backend, React + TypeScript frontend, optional Tauri desktop packaging.</p>
</div>

## ✨ Features

- End-to-end encrypted payload transport (PBKDF2 + AES-GCM in browser).
- Real-time messaging over WebSockets.
- Presence tracking (online/offline), typing signals, and history sync.
- Browser notifications for incoming messages.
- Modular frontend architecture with reusable components.
- Tauri-ready project structure for desktop delivery.

## 🧱 Architecture

```text
React (Vite + TS)  <--ws-->  FastAPI WebSocket Gateway
     |                                |
 Web Crypto E2E                In-memory rooms/clients
```

### Frontend Modules

- `src/App.tsx` – orchestration, WS lifecycle, decrypt/encrypt flow, notifications.
- `src/components/` – `Sidebar`, `ChatWindow`, `Composer`.
- `src/hooks/useNotifications.ts` – permission + notification dispatch.
- `src/crypto.ts` – PBKDF2 key derivation + AES-GCM encryption.

### Backend Modules

- `backend/main.py` – `/ws/{user_id}` endpoint, `message`, `typing`, `ack`, `history`, and presence broadcast.
- `backend/requirements.txt` – FastAPI runtime dependencies.

## 🖥️ UI Preview

The interface follows a clean chat-client layout:

- Left pane: contacts/presence.
- Right pane: message stream, typing indicator, composer.
- Top bar: profile identity, shared secret input, notifications toggle.

## 🚀 Quick Start

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
cd ..
npm install
npm run dev
```

Open: `http://localhost:1420`

### 3) Tauri (optional)

```bash
npm run tauri dev
```

## 🔒 Encryption Notes

- Messages are encrypted on client side before sending.
- Backend stores only ciphertext payloads.
- Shared passphrase must match across participants to decrypt.
- Current implementation is a starter and does **not** yet include identity key exchange, forward secrecy, or ratcheting.

## 📦 Production Hardening Checklist

- Replace in-memory storage with PostgreSQL/Redis.
- Add JWT auth and refresh flow.
- Add per-room ACL and message retention policies.
- Add rate limiting and abuse protection.
- Add delivery/read receipts persistence.
- Add observability (metrics, tracing, structured logs).

## 🧪 Validation

```bash
python -m py_compile backend/main.py
```

## 📄 License

MIT (recommended for starter template usage).
