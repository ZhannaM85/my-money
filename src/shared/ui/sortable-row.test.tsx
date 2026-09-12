import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SortableRow } from './sortable-row'

describe('SortableRow (#236)', () => {
  it('renders a grip with the reorder label', () => {
    render(
      <DndContext collisionDetection={closestCenter}>
        <SortableContext items={['a1']} strategy={verticalListSortingStrategy}>
          <ul>
            <SortableRow id="a1" reorderLabel="Reorder Cash">
              <span>Cash</span>
            </SortableRow>
          </ul>
        </SortableContext>
      </DndContext>,
    )
    expect(
      screen.getByRole('button', { name: 'Reorder Cash' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })
})
