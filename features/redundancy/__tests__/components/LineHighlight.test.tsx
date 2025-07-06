/**
 * Tests for LineHighlight Component
 */

import React from 'react'
import { renderWithRedundancy, mockLines } from '../../testing/utils'
import { LineHighlight } from '../../components/LineHighlight'

describe('LineHighlight Component', () => {
  test('should render with default props', () => {
    const { container } = renderWithRedundancy(<LineHighlight />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('should render with custom lines', () => {
    const { container } = renderWithRedundancy(
      <LineHighlight lines={mockLines} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  // More comprehensive tests will be added as components are implemented
})