/**
 * Plugin system type definitions
 */

import type { ComponentType } from 'react'

export interface FeatureDefinition {
  id: string
  name: string
  version: string
  description: string
  component: ComponentType<Record<string, unknown>>
  config: Record<string, unknown>
  dependencies?: string[]
  enabled: boolean
}

export interface FeatureRegistry {
  register: (feature: FeatureDefinition) => void
  unregister: (featureId: string) => void
  isRegistered: (featureId: string) => boolean
  getFeature: (featureId: string) => FeatureDefinition | undefined
  getAllFeatures: () => FeatureDefinition[]
  getEnabledFeatures: () => FeatureDefinition[]
  enableFeature: (featureId: string) => void
  disableFeature: (featureId: string) => void
}

export interface PluginError extends Error {
  featureId?: string
  phase?: string
  recoverable?: boolean
}

export interface FeatureLifecycle {
  onMount?: () => void | Promise<void>
  onUnmount?: () => void | Promise<void>
  onEnable?: () => void | Promise<void>
  onDisable?: () => void | Promise<void>
  onError?: (error: PluginError) => void
}

export interface FeatureContext {
  featureId: string
  config: Record<string, unknown>
  registry: FeatureRegistry
  lifecycle: FeatureLifecycle
}
