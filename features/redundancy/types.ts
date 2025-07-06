/**
 * TypeScript interfaces for 2N+1 Redundancy Feature
 */

export interface RedundancyConfig {
  name: string
  version: string
  description: string
  featureFlag: string
  colors: {
    active: string
    standby: string
    connection: string
    glow: {
      intensity: number
      radius: number
    }
  }
  animations: {
    overlay: {
      fadeIn: number
      sequence: {
        lines: number
        substations: number
        panel: number
      }
    }
    pulse: {
      duration: number
      easing: string
    }
  }
  substations: Record<string, SubstationConfig>
  lines: LineConfig[]
  statistics: StatisticsConfig
  cssPrefix: string
  zIndex: Record<string, number>
}

export interface SubstationConfig {
  name: string
  status: 'ACTIVE' | 'STANDBY'
  capacity: string
  position:
    | 'existing'
    | {
        relative: string
        distance: string
        direction: string
      }
  color: string
}

export interface LineConfig {
  id: string
  from: string
  to: string
  status: 'active' | 'standby'
  voltage: string
}

export interface StatisticsConfig {
  dataCenterNeeds: string
  totalCapacity: string
  redundancyRatio: string
  activeCapacity: string
  standbyCapacity: string
}

export interface RedundancyState {
  isActive: boolean
  selectedSubstation: SubstationData | null
  selectedLine: LineData | null
  isPanelOpen: boolean
  animationProgress: number
}

export interface SubstationData {
  id: string
  name: string
  status: 'ACTIVE' | 'STANDBY'
  capacity: string
  position: {
    x: number
    y: number
  }
  color: string
  connections: string[]
}

export interface LineData {
  id: string
  from: string
  to: string
  status: 'active' | 'standby'
  voltage: string
  path: string // SVG path data
  color: string
  glowIntensity: number
}

export interface RedundancyStats {
  dataCenterNeeds: string
  activeNow: {
    sources: string[]
    capacity: string
  }
  standbyReady: {
    sources: string[]
    capacity: string
  }
  totalCapacity: string
  redundancyRatio: string
}

export interface CoordinateSystem {
  mapWidth: number
  mapHeight: number
  viewportWidth: number
  viewportHeight: number
  scale: number
  offset: {
    x: number
    y: number
  }
}

export interface Position {
  x: number
  y: number
}

export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
}

export interface RedundancyProviderProps {
  children: React.ReactNode
  config?: Partial<RedundancyConfig>
}

export interface RedundancyOverlayProps {
  isVisible: boolean
  onClose: () => void
  animationPhase: RedundancyState['animationPhase']
}

export interface RedundancyButtonProps {
  className?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export interface InfoPanelProps {
  stats: RedundancyStats
  isVisible: boolean
  onClose: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export interface LineHighlightProps {
  lines: LineData[]
  isVisible: boolean
  animationDelay: number
}

export interface SubstationMarkerProps {
  substations: SubstationData[]
  isVisible: boolean
  animationDelay: number
  onSubstationClick?: (substation: SubstationData) => void
}

export interface PowerFlowAnimationProps {
  lines: LineData[]
  isVisible: boolean
  flowSpeed: number
}

export interface FeatureRegistry {
  register: (feature: FeatureDefinition) => void
  unregister: (featureId: string) => void
  isRegistered: (featureId: string) => boolean
  getFeature: (featureId: string) => FeatureDefinition | undefined
  getAllFeatures: () => FeatureDefinition[]
}

export interface FeatureDefinition {
  id: string
  name: string
  version: string
  description: string
  component: React.ComponentType
  config: Record<string, unknown>
  dependencies?: string[]
  enabled: boolean
}

export interface PluginError extends Error {
  featureId?: string
  phase?: string
  recoverable?: boolean
}

export interface RedundancyOverlayConfig {
  zIndex: number
  position: 'absolute' | 'fixed' | 'relative'
  enableKeyboardControls: boolean
  enableMouseControls: boolean
  enableTouchControls: boolean
  autoHide: boolean
  hideDelay: number
  animationDuration: number
  theme: 'default' | 'dark' | 'light'
}
