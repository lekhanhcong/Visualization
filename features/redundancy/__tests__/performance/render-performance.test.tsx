/**
 * Performance Tests for Component Rendering
 */

import React from 'react'
import { measureRenderTime, renderWithRedundancy, generateRandomLines } from '../../testing/utils'
import { LineHighlight } from '../../components/LineHighlight'

describe('Render Performance', () => {
  test('should render LineHighlight quickly with many lines', async () => {
    const manyLines = generateRandomLines(100)
    
    const renderTime = await measureRenderTime(() => {
      renderWithRedundancy(<LineHighlight lines={manyLines} />)
    })
    
    expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
  })

  test('should handle rapid re-renders efficiently', async () => {
    const { rerender } = renderWithRedundancy(<LineHighlight />)
    
    const rerenderTime = await measureRenderTime(() => {
      for (let i = 0; i < 10; i++) {
        rerender(<LineHighlight isVisible={i % 2 === 0} />)
      }
    })
    
    expect(rerenderTime).toBeLessThan(50) // Should handle 10 re-renders in less than 50ms
  })

  // More performance tests will be added
})