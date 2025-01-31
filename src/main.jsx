import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./assets/fonts/Atma/Atma-Regular.ttf";
import "./assets/fonts/Montserrat/Montserrat-Regular.ttf";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{fontFamily:'Montserrat'}}>
    <App />
    </div>
  </StrictMode>,
)
