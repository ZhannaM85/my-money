/** Where the user opened Allocation from (#323). Owner tab is always Dashboard. */
export type AllocationEntry = 'dashboard' | 'settings'

export type AllocationLocationState = {
  from?: AllocationEntry
}

export function allocationEntryFromState(
  state: unknown,
): AllocationEntry {
  if (
    state &&
    typeof state === 'object' &&
    'from' in state &&
    (state as AllocationLocationState).from === 'settings'
  ) {
    return 'settings'
  }
  return 'dashboard'
}

export function allocationParentPath(entry: AllocationEntry): string {
  return entry === 'settings' ? '/settings' : '/'
}
