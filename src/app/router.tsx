import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { DashboardScreen } from '@/features/dashboard'
import {
  AssetDetailsScreen,
  AssetsScreen,
  NewAssetScreen,
} from '@/features/assets'
import { UpdateFinancesScreen } from '@/features/update-finances'
import { AllocationScreen } from '@/features/allocation'
import { HistoryScreen } from '@/features/history'
import { SettingsScreen } from '@/features/settings'
import { OnboardingScreen } from '@/features/onboarding'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardScreen /> },
      { path: '/assets', element: <AssetsScreen /> },
      { path: '/assets/new', element: <NewAssetScreen /> },
      { path: '/assets/:id', element: <AssetDetailsScreen /> },
      { path: '/update', element: <UpdateFinancesScreen /> },
      { path: '/allocation', element: <AllocationScreen /> },
      { path: '/history', element: <HistoryScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
      { path: '/onboarding', element: <OnboardingScreen /> },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
})
