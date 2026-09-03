import { render } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/Skeleton'

describe('Skeleton', () => {
  it('套用傳入的 className', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />)
    expect(container.firstChild).toHaveClass('skeleton-shimmer', 'h-4', 'w-10')
  })

  it('SkeletonText 依 lines 產生對應數量的骨架列', () => {
    const { container } = render(<SkeletonText lines={5} />)
    expect(container.querySelectorAll('.skeleton-shimmer')).toHaveLength(5)
  })

  it('SkeletonCard 可正常渲染', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelectorAll('.skeleton-shimmer').length).toBeGreaterThan(0)
  })
})
