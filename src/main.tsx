import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted variable fonts — no runtime font-CDN dependency.
import '@fontsource-variable/cormorant-garamond'
import '@fontsource-variable/jost'

import App from '@/app/App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
