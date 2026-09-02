import { Capacitor, registerPlugin } from '@capacitor/core'

interface HomeScreenWidgetPlugin {
  setEnabled: (options: { enabled: boolean }) => Promise<void>
}

const HomeScreenWidget = registerPlugin<HomeScreenWidgetPlugin>(
  'HomeScreenWidget',
)

export async function setHomeScreenWidgetProviderEnabled(
  enabled: boolean,
): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  await HomeScreenWidget.setEnabled({ enabled })
}
