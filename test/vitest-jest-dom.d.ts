import 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  // Vitest 5: Assertion<R, T> / Matchers<R, T>. jest-dom 7 still augments Assertion<T> only.
  interface Assertion<R = any, T = any>
    extends TestingLibraryMatchers<any, R> {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<any, any> {}
  interface Matchers<R = void, T = unknown>
    extends TestingLibraryMatchers<any, R> {}
}
