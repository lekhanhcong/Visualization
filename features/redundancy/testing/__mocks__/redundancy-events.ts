/**
 * Mock Redundancy Events
 * Mock implementations for testing redundancy events
 */

export const mockRedundancyEventBus = {
  on: jest.fn(() => jest.fn()), // Returns unsubscribe function
  off: jest.fn(),
  emit: jest.fn(),
  clear: jest.fn(),
  getListeners: jest.fn(() => ({})),
  hasListeners: jest.fn(() => false)
}

export const mockRedundancyEvents = {
  emitSubstationSelect: jest.fn(),
  emitSubstationHover: jest.fn(),
  emitLineSelect: jest.fn(),
  emitLineHover: jest.fn(),
  emitStateChange: jest.fn(),
  emitPanelToggle: jest.fn(),
  emitOverlayToggle: jest.fn(),
  emitAnimationToggle: jest.fn()
}

// Event constants for testing
export const REDUNDANCY_EVENTS = {
  SUBSTATION_SELECT: 'redundancy:substation:select',
  SUBSTATION_HOVER: 'redundancy:substation:hover',
  LINE_SELECT: 'redundancy:line:select',
  LINE_HOVER: 'redundancy:line:hover',
  STATE_CHANGE: 'redundancy:state:change',
  PANEL_TOGGLE: 'redundancy:panel:toggle',
  OVERLAY_TOGGLE: 'redundancy:overlay:toggle',
  ANIMATION_TOGGLE: 'redundancy:animation:toggle'
}

export default mockRedundancyEventBus