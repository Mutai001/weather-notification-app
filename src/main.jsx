import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WeatherNotification from './components/WeatherNotification.jsx'
import './index.css'; // or './main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeatherNotification />
  </StrictMode>,
)
