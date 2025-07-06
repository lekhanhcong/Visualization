/**
 * 2N+1 Redundancy Feature - Entry Point
 * Professional investor-grade visualization for power redundancy
 */

// Components will be exported when implemented
// export { RedundancyProvider } from './components/RedundancyProvider'
// export { RedundancyOverlay } from './components/RedundancyOverlay'
// export { RedundancyButton } from './components/RedundancyButton'
// export { InfoPanel } from './components/InfoPanel'
// export { LineHighlight } from './components/LineHighlight'
// export { SubstationMarker } from './components/SubstationMarker'
// export { PowerFlowAnimation } from './components/PowerFlowAnimation'

export type {
  RedundancyConfig,
  RedundancyState,
  SubstationData,
  LineData,
  RedundancyStats,
} from './types'

export { redundancyConfig } from './config'
// export { registerRedundancyFeature } from './plugin'

// Feature metadata
export const FEATURE_INFO = {
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional investor-grade power redundancy visualization',
  status: 'in-development',
} as const
