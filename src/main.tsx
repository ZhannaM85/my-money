import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import '@/stores/themeStore'
import { router } from '@/app/router'
import { registerServiceWorker } from '@/shared/lib/registerServiceWorker'
import { initBackButtonHandler } from '@/shared/native/backButtonHandler'

registerServiceWorker()
initBackButtonHandler()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
