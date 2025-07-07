/**
 * Integration Tests for Component Composition
 */

import React from 'react'
import { renderWithRedundancy } from '../../testing/utils'
import { RedundancyHierarchy } from '../../composition/ComponentHierarchy'

describe('Component Composition Integration', () => {
  test('should render complete hierarchy without errors', () => {
    const { container } = renderWithRedundancy(<RedundancyHierarchy />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('should handle component interactions', () => {
    const { container } = renderWithRedundancy(
      <RedundancyHierarchy 
        config={{
          features: {
            enableLineHighlight: true,
            enableSubstationMarker: true,
            enableInfoPanel: true,
            enableRedundancyButton: true
          }
        }}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  // More comprehensive integration tests will be added
})