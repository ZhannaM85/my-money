import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAssetReorder } from './useAssetReorder'

describe('useAssetReorder (#105)', () => {
  it('keeps a drop local until Save, and Cancel restores the persisted order', async () => {
    const persist = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAssetReorder(['a', 'b', 'c']),
    )

    act(() => {
      result.current.enter(['a', 'b', 'c'], ['a', 'b', 'c'])
    })
    act(() => {
      result.current.drop(['a', 'b', 'c'], ['a', 'b', 'c'], 0, 2)
    })
    expect(result.current.order).toEqual(['b', 'c', 'a'])
    expect(persist).not.toHaveBeenCalled()

    act(() => {
      result.current.cancel()
    })
    expect(result.current.order).toEqual(['a', 'b', 'c'])
    expect(result.current.reordering).toBe(false)
    expect(persist).not.toHaveBeenCalled()

    act(() => {
      result.current.enter(['a', 'b', 'c'], ['a', 'b', 'c'])
    })
    act(() => {
      result.current.drop(['a', 'b', 'c'], ['a', 'b', 'c'], 0, 2)
    })
    await act(async () => {
      await result.current.save(persist, ['a', 'b', 'c'])
    })
    expect(persist).toHaveBeenCalledTimes(1)
    expect(persist).toHaveBeenCalledWith(['b', 'c', 'a'])
    expect(result.current.reordering).toBe(false)
  })
})
