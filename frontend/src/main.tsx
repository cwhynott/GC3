/**
 * CS-410: Entry point for the React application
 * @file main.tsx
 * @authors 
 * @collaborators None
 * @date February 26, 2025
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
