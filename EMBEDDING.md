# Embedding the chatbot via iframe

## What you have now (stack + auth)

- UI: React + TypeScript + Vite + Tailwind
- Backend access:
  - REST calls via Axios to `VITE_API_BASE_URL` (fallback `/api/v1`)
  - WebSocket chat via `${VITE_API_BASE_URL}/ws/chat?api_key=...`
- Auth: client-side API key (`VITE_API_KEY`) sent as `X-API-KEY` (REST) and `api_key` query param (WS)

This means you are **not** relying on cookies, which is good for iframes (third‑party cookie restrictions won’t break the session).

## The embed page

This repo now ships an iframe-friendly entry point:

- `embed.html` → builds to `dist/embed.html`

In dev:

- `http://localhost:5173/embed.html`

In prod:

- `https://<your-domain>/embed.html`

## Copy/paste snippet for external sites

```html
<iframe
  src="https://<your-domain>/embed.html?token=<EMBED_TOKEN>"
  title="Chatbot"
  style="position:fixed; right:20px; bottom:20px; width:380px; height:600px; border:0; z-index:999999;"
  allow="clipboard-read; clipboard-write"
></iframe>
```

The `<EMBED_TOKEN>` should be short-lived and minted by your FastAPI backend (don’t hard-code long-lived credentials into partner websites).

If you want a “launcher button” on the partner site, keep the iframe hidden and toggle it with the partner’s own JS/CSS.

The iframe can also signal close requests to the parent:

- `window.postMessage({ type: "OM_CHATBOT_CLOSE" }, "*")`

## Server headers you’ll need (important)

To allow embedding *only* on approved sites, configure your hosting/reverse-proxy to send CSP headers:

- `Content-Security-Policy: frame-ancestors 'self' https://partner-example.com https://*.partner-example.com`

Do **not** send `X-Frame-Options: DENY` or `SAMEORIGIN` for `embed.html`.

## Security note about `VITE_API_KEY`

Because `VITE_API_KEY` is bundled into client JavaScript, it is **not a secret** once shipped.

If your backend treats this key as sensitive, the safer pattern is:

- Replace static API keys with short-lived tokens minted server-side per partner/site (or a public “client id” + server-side checks)
- Validate allowed origins / partner ids on the backend

If you tell me what backend you control (FastAPI/Express/etc.), I can outline the minimal token endpoint + checks needed.

## FastAPI: minimal secure embed-token pattern

If your backend is FastAPI, the simplest robust approach is:

1) The partner site requests a short-lived **embed token** from your backend.
2) The iframe loads `embed.html?token=...` (or you pass the token via `postMessage`).
3) Every REST + WebSocket request validates the token server-side.

This avoids shipping a static API key in the frontend.

### Token shape

Use a signed JWT with short expiry, containing at least:

- `partner_id` (tenant)
- `exp` (e.g., 5–15 minutes)

Note: requests made from inside the iframe originate from your chatbot domain, so `Origin`/`Referer` on API calls generally won’t tell you the *parent* website. Use **CSP `frame-ancestors`** on the embed page to control who can iframe it.

### FastAPI example (HTTP)

Dependencies:

- `pip install "python-jose[cryptography]"`

```py
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from jose import jwt, JWTError

app = FastAPI()

JWT_SECRET = "change-me"  # keep in env var
JWT_ALG = "HS256"

# Example partner allowlist
PARTNERS = {
  "acme": {
    "embed_key": "acme-embed-shared-secret",  # partner-specific shared secret
    "allowed_origins": {"https://www.acme.com", "https://staging.acme.com"},
  }
}


def mint_embed_token(partner_id: str, origin: str) -> str:
  now = datetime.now(timezone.utc)
  payload = {
    "partner_id": partner_id,
    "iat": int(now.timestamp()),
    "exp": int((now + timedelta(minutes=10)).timestamp()),
  }
  return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def verify_embed_token(token: str) -> dict:
  try:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
  except JWTError:
    raise HTTPException(status_code=401, detail="invalid token")

  partner_id = payload.get("partner_id")
  if not isinstance(partner_id, str) or partner_id not in PARTNERS:
    raise HTTPException(status_code=401, detail="invalid partner")

  return payload


@app.post("/api/v1/embed/token")
def create_embed_token(
  partner_id: str,
  x_embed_key: str = Header(default=""),
  x_embed_origin: Optional[str] = Header(default=None),
):
  # Partner site calls this from their server (best), or from browser (ok) if you can protect the key.
  if partner_id not in PARTNERS:
    raise HTTPException(status_code=404, detail="unknown partner")
  if x_embed_key != PARTNERS[partner_id]["embed_key"]:
    raise HTTPException(status_code=401, detail="invalid embed key")

  # Optional: if your partner provides the site they will embed on, you can validate it
  # against your allowlist for auditing/config.
  if x_embed_origin and x_embed_origin not in PARTNERS[partner_id]["allowed_origins"]:
    raise HTTPException(status_code=403, detail="embed origin not allowed")

  return {"token": mint_embed_token(partner_id, x_embed_origin or "")}
```

### FastAPI example (protect your existing endpoints)

For your existing REST handlers, require an `Authorization: Bearer <token>` header and verify it.

```py
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

auth = HTTPBearer(auto_error=False)


def require_embed_auth(
  creds: HTTPAuthorizationCredentials = Depends(auth),
):
  if not creds or creds.scheme.lower() != "bearer":
    raise HTTPException(status_code=401, detail="missing bearer token")
  return verify_embed_token(creds.credentials)


@app.post("/api/v1/chat/message")
def chat_message(payload: dict, token_payload: dict = Depends(require_embed_auth)):
  # token_payload contains partner_id/origin
  return {"ok": True}
```

### WebSocket auth

For WebSockets, pass the token as a query param (or as a `Sec-WebSocket-Protocol` subprotocol) and verify it during connect.

```py
from fastapi import WebSocket, WebSocketDisconnect


@app.websocket("/api/v1/ws/chat")
async def ws_chat(websocket: WebSocket, token: str):
  try:
    verify_embed_token(token)
  except HTTPException:
    await websocket.close(code=4401)
    return

  await websocket.accept()
  try:
    while True:
      msg = await websocket.receive_text()
      await websocket.send_text(msg)
  except WebSocketDisconnect:
    pass
```

### CORS + embedding headers

- Add `CORSMiddleware` if your API is called from browsers on other origins.
  - If the chatbot UI and API are same-origin (recommended), you can keep CORS tight/simple.
- Separately configure **CSP `frame-ancestors`** on the HTML response for `embed.html` to control which partner domains may embed the widget.
  - If you serve `embed.html` from FastAPI too, you can add a small middleware to set:
  - `Content-Security-Policy: frame-ancestors 'self' https://partner...`

If you want, I can also update the frontend to use `Authorization: Bearer <token>` instead of `VITE_API_KEY` (REST + WebSocket), using `token` from the `embed.html` query string.
