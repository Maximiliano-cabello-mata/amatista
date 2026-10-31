import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Fuentes empaquetadas con la app: funcionan sin conexión
import '@fontsource-variable/outfit'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import { aplicarModoLigero } from './lib/rendimiento'
import { iniciarSentry } from './lib/sentry'

// Equipos modestos: sin animaciones continuas ni fondo facetado (index.css › html.ligero).
aplicarModoLigero()
// Errores a Sentry solo si se compiló con VITE_SENTRY_DSN (lib/sentry.js).
iniciarSentry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
