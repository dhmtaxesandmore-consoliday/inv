import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CoralGablesOpening from './CoralGablesOpening.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CoralGablesOpening />} />
        <Route path="/hq" element={<App />} />
        <Route path="/coral-gables-opening" element={<CoralGablesOpening />} />
        <Route path="/grand-opening" element={<CoralGablesOpening />} />
        <Route path="/mortgage-opening" element={<CoralGablesOpening />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
