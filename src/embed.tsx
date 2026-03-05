import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import ChatbotWidget from "./components/chatbot/ChatbotWidget";
import { initEmbedTokenFromLocation } from "./config/runtimeAuth";

// Initialize auth token (if present) from ?token=... query param.
// This keeps iframe embedding compatible with FastAPI token auth.
initEmbedTokenFromLocation(window.location.search);

const params = new URLSearchParams(window.location.search);
// Match the main app/widget behavior: teaser bubble is enabled by default.
// Allow disabling explicitly for special cases.
const teaserEnabled = params.get("teaser") !== "0";

function EmbedApp() {
  return (
    <ChatbotWidget teaser={teaserEnabled} />
  );
}

const rootEl = (() => {
  const existing = document.getElementById("root");
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = "root";
  if (document.body) document.body.appendChild(el);
  else document.documentElement.appendChild(el);
  return el;
})();

createRoot(rootEl).render(
  <StrictMode>
    <EmbedApp />
  </StrictMode>,
);
