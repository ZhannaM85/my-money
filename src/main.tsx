import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import '@/stores/themeStore'
import { router } from '@/app/router'
import { registerServiceWorker } from '@/shared/lib/registerServiceWorker'
import { initBackButtonHandler } from '@/shared/native/backButtonHandler'
import { initWidgetDataSync } from '@/shared/native/widgetDataSync'

registerServiceWorker()
initBackButtonHandler()
initWidgetDataSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
