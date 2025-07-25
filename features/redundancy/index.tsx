/**
 * 2N+1 Redundancy Feature - Entry Point
 * Professional investor-grade visualization for power redundancy
 */

// Export all components
export { RedundancyProvider, useRedundancy } from './components/RedundancyProvider'
export { RedundancyOverlay } from './components/RedundancyOverlay'
export { RedundancyButton } from './components/RedundancyButton'
export { InfoPanel } from './components/InfoPanel'
export { LineHighlight } from './components/LineHighlight'
export { SubstationMarker } from './components/SubstationMarker'
export { PowerFlowAnimation } from './components/PowerFlowAnimation'

// Export main feature component
export { RedundancyFeature } from './RedundancyFeature'

// Export component types
export * from './components/index'

export type {
  RedundancyConfig,
  RedundancyState,
  SubstationData,
  LineData,
  RedundancyStats,
  FeatureDefinition
} from './types'

export { redundancyConfig } from './config'

// Import for feature definition
import { RedundancyFeature } from './RedundancyFeature'

// Feature definition for plugin registration
export const redundancyFeatureDefinition = {
  id: 'redundancy-2n1',
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional-grade power redundancy visualization for data centers',
  component: RedundancyFeature,
  config: {
    featureFlag: 'NEXT_PUBLIC_ENABLE_REDUNDANCY',
    cssPrefix: 'rdx-',
    animationDuration: 4000,
    enableAnimations: true
  },
  dependencies: [],
  enabled: process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true'
};

// Feature metadata
export const FEATURE_INFO = {
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional investor-grade power redundancy visualization',
  status: 'implemented',
} as const

// Default export
export default RedundancyFeature;
