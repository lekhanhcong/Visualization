/**
 * Accessibility Tests for Keyboard Navigation
 */

import React from 'react'
import { renderWithRedundancy, simulateKeyboardEvent } from '../../testing/utils'
import { RedundancyButton } from '../../components/RedundancyButton'

describe('Keyboard Navigation Accessibility', () => {
  test('should be focusable with tab key', () => {
    const { getByTestId } = renderWithRedundancy(
      <RedundancyButton data-testid="redundancy-button" />
    )
    
    const button = getByTestId('redundancy-button')
    expect(button).toHaveAttribute('tabindex')
    expect(button.getAttribute('tabindex')).not.toBe('-1')
  })

  test('should respond to enter and space keys', () => {
    const onClick = jest.fn()
    const { getByTestId } = renderWithRedundancy(
      <RedundancyButton data-testid="redundancy-button" onClick={onClick} />
    )
    
    const button = getByTestId('redundancy-button')
    
    simulateKeyboardEvent(button, 'Enter')
    expect(onClick).toHaveBeenCalled()
    
    onClick.mockClear()
    simulateKeyboardEvent(button, ' ')
    expect(onClick).toHaveBeenCalled()
  })

  // More accessibility tests will be added
})