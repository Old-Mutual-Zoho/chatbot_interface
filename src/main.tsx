import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = (() => {
  const existing = document.getElementById('root');
  if (existing) return existing;
  const el = document.createElement('div');
  el.id = 'root';
  // Append so the widget can bootstrap on any host page.
  // (If <body> isn't available yet, fall back to <html>.)
  if (document.body) document.body.appendChild(el);
  else document.documentElement.appendChild(el);
  return el;
})();

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
