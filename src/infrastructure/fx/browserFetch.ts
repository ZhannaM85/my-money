/** Safari requires fetch to be invoked as a Window method, not a detached reference. */
export const browserFetch: typeof fetch = (input, init) =>
  globalThis.fetch(input, init)
