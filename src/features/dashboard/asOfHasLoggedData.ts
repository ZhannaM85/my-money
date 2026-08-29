/** True when Dashboard should plot the net-worth line for the As of date (#145). */
export function asOfHasLoggedData(
  selectedDate: string | null,
  earliestSnapshotDate: string,
): boolean {
  if (selectedDate === null) return true
  return selectedDate >= earliestSnapshotDate
}
