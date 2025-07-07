/**
 * Visual Regression Tests using Snapshots
 */

import React from 'react'
import { renderWithRedundancy, mockLines, mockSubstations } from '../../testing/utils'
import { RedundancyOverlay } from '../../components/RedundancyOverlay'
import { LineHighlight } from '../../components/LineHighlight'

describe('Component Visual Snapshots', () => {
  test('RedundancyOverlay should match snapshot', () => {
    const { container } = renderWithRedundancy(
      <RedundancyOverlay>
        <div>Test Content</div>
      </RedundancyOverlay>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('LineHighlight should match snapshot with lines', () => {
    const { container } = renderWithRedundancy(
      <LineHighlight lines={mockLines} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should match snapshot in different states', () => {
    const { container } = renderWithRedundancy(
      <LineHighlight lines={mockLines} isVisible={false} />
    )
    expect(container.firstChild).toMatchSnapshot('LineHighlight-hidden')
  })

  // More visual regression tests will be added
})