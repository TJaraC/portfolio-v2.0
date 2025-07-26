import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import initBrowserCompatibility from './utils/browserCompatibility'
// NO debe tener: import './utils/headerColorDetector.js'

// Initialize browser compatibility utilities
initBrowserCompatibility();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
