import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { pipelineStore } from './store/pipelineStore';

if (import.meta.env.DEV) {
  Object.assign(window, { pipelineStore });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

