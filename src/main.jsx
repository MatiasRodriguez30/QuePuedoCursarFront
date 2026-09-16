import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registro del service worker (sólo en producción: en dev con HMR sólo
// causaría cachear módulos viejos por error). Requisito de Chrome/Android
// para poder instalar la app como PWA.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* no rompe la app si falla */ })
  })
}
