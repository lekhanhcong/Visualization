/**
 * Tests for RedundancyProvider
 */

import React from 'react'
import { render } from '@testing-library/react'
import { RedundancyProvider, useRedundancy } from '../../providers/RedundancyProvider'

const TestConsumer = () => {
  const { state, isDependenciesResolved } = useRedundancy()
  return (
    <div>
      <div data-testid="enabled">{state?.isEnabled ? 'true' : 'false'}</div>
      <div data-testid="resolved">{isDependenciesResolved ? 'true' : 'false'}</div>
    </div>
  )
}

describe('RedundancyProvider', () => {
  test('should provide context to children', () => {
    const { getByTestId } = render(
      <RedundancyProvider enabled={true}>
        <TestConsumer />
      </RedundancyProvider>
    )
    
    expect(getByTestId('enabled')).toHaveTextContent('true')
    expect(getByTestId('resolved')).toBeInTheDocument()
  })

  test('should handle disabled state', () => {
    const { getByTestId } = render(
      <RedundancyProvider enabled={false}>
        <TestConsumer />
      </RedundancyProvider>
    )
    
    expect(getByTestId('enabled')).toHaveTextContent('false')
  })

  // More comprehensive tests will be added as provider is implemented
})