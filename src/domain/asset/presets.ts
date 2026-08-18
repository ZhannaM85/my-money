import type { AssetClass, AssetType } from '@/domain/asset'

export interface AssetPreset {
  id: string
  assetClass: AssetClass
  type: AssetType
}

export const ASSET_PRESETS: readonly AssetPreset[] = [
  { id: 'bank', assetClass: 'money', type: 'bank' },
  { id: 'cash', assetClass: 'money', type: 'cash' },
  { id: 'vehicle', assetClass: 'property', type: 'vehicle' },
  { id: 'apartment', assetClass: 'property', type: 'apartment' },
  { id: 'brokerage', assetClass: 'investments', type: 'brokerage' },
]

export function findAssetPreset(id: string): AssetPreset | undefined {
  return ASSET_PRESETS.find((preset) => preset.id === id)
}
