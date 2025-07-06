/**
 * Component Hierarchy Definition
 * Defines the composition structure for 2N+1 Redundancy components
 */

import React from 'react'
import { RedundancyProvider } from '../providers/RedundancyProvider'
import { RedundancyOverlay } from '../components/RedundancyOverlay'
import { LineHighlight } from '../components/LineHighlight'
import { SubstationMarker } from '../components/SubstationMarker'
import { PowerFlowAnimation } from '../components/PowerFlowAnimation'
import { InfoPanel } from '../components/InfoPanel'
import { RedundancyButton } from '../components/RedundancyButton'
import type { 
  RedundancyOverlayProps,
  LineHighlightProps,
  SubstationMarkerProps,
  PowerFlowAnimationProps,
  InfoPanelProps,
  RedundancyButtonProps
} from '../types'

// Component hierarchy configuration
export interface RedundancyHierarchyConfig {
  // Provider configuration
  enabled?: boolean
  
  // Base overlay configuration
  overlay?: Partial<RedundancyOverlayProps>
  
  // Visualization layer components
  visualization?: {
    lineHighlight?: Partial<LineHighlightProps>
    substationMarker?: Partial<SubstationMarkerProps>
    powerFlowAnimation?: Partial<PowerFlowAnimationProps>
  }
  
  // Application layer components
  application?: {
    infoPanel?: Partial<InfoPanelProps>
    redundancyButton?: Partial<RedundancyButtonProps>
  }
  
  // Feature flags
  features?: {
    enableLineHighlight?: boolean
    enableSubstationMarker?: boolean
    enablePowerFlowAnimation?: boolean
    enableInfoPanel?: boolean
    enableRedundancyButton?: boolean
  }
}

// Default configuration
const defaultConfig: RedundancyHierarchyConfig = {
  enabled: true,
  features: {
    enableLineHighlight: true,
    enableSubstationMarker: true,
    enablePowerFlowAnimation: true,
    enableInfoPanel: true,
    enableRedundancyButton: true
  }
}

/**
 * Complete Redundancy Component Hierarchy
 * Renders the full component stack with proper layering
 */
export function RedundancyHierarchy({
  config = defaultConfig,
  children
}: {
  config?: RedundancyHierarchyConfig
  children?: React.ReactNode
}) {
  const mergedConfig = { ...defaultConfig, ...config }
  const { enabled, overlay, visualization, application, features } = mergedConfig

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <RedundancyProvider enabled={enabled}>
      {/* Base Layer: Overlay Container */}
      <RedundancyOverlay {...overlay}>
        {/* Visualization Layer: Bottom to Top (z-index order) */}
        
        {/* SubstationMarker - z-index: 110 */}
        {features?.enableSubstationMarker && (
          <SubstationMarker
            {...visualization?.substationMarker}
          />
        )}
        
        {/* LineHighlight - z-index: 115 */}
        {features?.enableLineHighlight && (
          <LineHighlight
            {...visualization?.lineHighlight}
          />
        )}
        
        {/* PowerFlowAnimation - z-index: 120 */}
        {features?.enablePowerFlowAnimation && (
          <PowerFlowAnimation
            {...visualization?.powerFlowAnimation}
          />
        )}
        
        {/* User content */}
        {children}
      </RedundancyOverlay>
      
      {/* Application Layer: UI Controls */}
      
      {/* InfoPanel - z-index: 150 */}
      {features?.enableInfoPanel && (
        <InfoPanel
          {...application?.infoPanel}
        />
      )}
      
      {/* RedundancyButton - z-index: 200 */}
      {features?.enableRedundancyButton && (
        <RedundancyButton
          {...application?.redundancyButton}
        />
      )}
    </RedundancyProvider>
  )
}

/**
 * Visualization-Only Hierarchy
 * Renders just the visualization components
 */
export function RedundancyVisualization({
  config = {}
}: {
  config?: Partial<RedundancyHierarchyConfig>
}) {
  const visualConfig: RedundancyHierarchyConfig = {
    ...defaultConfig,
    ...config,
    features: {
      enableLineHighlight: true,
      enableSubstationMarker: true,
      enablePowerFlowAnimation: true,
      enableInfoPanel: false,
      enableRedundancyButton: false
    }
  }

  return <RedundancyHierarchy config={visualConfig} />
}

/**
 * Controls-Only Hierarchy
 * Renders just the control components
 */
export function RedundancyControls({
  config = {}
}: {
  config?: Partial<RedundancyHierarchyConfig>
}) {
  const controlConfig: RedundancyHierarchyConfig = {
    ...defaultConfig,
    ...config,
    features: {
      enableLineHighlight: false,
      enableSubstationMarker: false,
      enablePowerFlowAnimation: false,
      enableInfoPanel: true,
      enableRedundancyButton: true
    }
  }

  return <RedundancyHierarchy config={controlConfig} />
}

/**
 * Minimal Hierarchy
 * Renders the essential components only
 */
export function RedundancyMinimal({
  config = {}
}: {
  config?: Partial<RedundancyHierarchyConfig>
}) {
  const minimalConfig: RedundancyHierarchyConfig = {
    ...defaultConfig,
    ...config,
    features: {
      enableLineHighlight: true,
      enableSubstationMarker: true,
      enablePowerFlowAnimation: false,
      enableInfoPanel: false,
      enableRedundancyButton: true
    }
  }

  return <RedundancyHierarchy config={minimalConfig} />
}

/**
 * Custom Hierarchy Builder
 * Allows building custom component compositions
 */
export class RedundancyHierarchyBuilder {
  private config: RedundancyHierarchyConfig = {
    enabled: true,
    features: {}
  }

  enableProvider(enabled: boolean = true): this {
    this.config.enabled = enabled
    return this
  }

  withOverlay(props: Partial<RedundancyOverlayProps>): this {
    this.config.overlay = { ...this.config.overlay, ...props }
    return this
  }

  withLineHighlight(props?: Partial<LineHighlightProps>): this {
    this.config.features!.enableLineHighlight = true
    if (props) {
      this.config.visualization = {
        ...this.config.visualization,
        lineHighlight: { ...this.config.visualization?.lineHighlight, ...props }
      }
    }
    return this
  }

  withSubstationMarker(props?: Partial<SubstationMarkerProps>): this {
    this.config.features!.enableSubstationMarker = true
    if (props) {
      this.config.visualization = {
        ...this.config.visualization,
        substationMarker: { ...this.config.visualization?.substationMarker, ...props }
      }
    }
    return this
  }

  withPowerFlowAnimation(props?: Partial<PowerFlowAnimationProps>): this {
    this.config.features!.enablePowerFlowAnimation = true
    if (props) {
      this.config.visualization = {
        ...this.config.visualization,
        powerFlowAnimation: { ...this.config.visualization?.powerFlowAnimation, ...props }
      }
    }
    return this
  }

  withInfoPanel(props?: Partial<InfoPanelProps>): this {
    this.config.features!.enableInfoPanel = true
    if (props) {
      this.config.application = {
        ...this.config.application,
        infoPanel: { ...this.config.application?.infoPanel, ...props }
      }
    }
    return this
  }

  withRedundancyButton(props?: Partial<RedundancyButtonProps>): this {
    this.config.features!.enableRedundancyButton = true
    if (props) {
      this.config.application = {
        ...this.config.application,
        redundancyButton: { ...this.config.application?.redundancyButton, ...props }
      }
    }
    return this
  }

  build(): React.ComponentType<{ children?: React.ReactNode }> {
    const config = this.config
    return ({ children }) => (
      <RedundancyHierarchy config={config}>
        {children}
      </RedundancyHierarchy>
    )
  }
}

// Export utility function for creating builder
export function createRedundancyHierarchy(): RedundancyHierarchyBuilder {
  return new RedundancyHierarchyBuilder()
}

// Export types
export type { RedundancyHierarchyConfig }