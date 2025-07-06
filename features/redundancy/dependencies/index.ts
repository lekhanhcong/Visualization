/**
 * Dependency Management Exports
 * Centralized export point for dependency management
 */

export { 
  RedundancyDependencyManager, 
  defaultDependencyConfig 
} from './DependencyManager'

export type { 
  FeatureDependency, 
  DependencyResolution, 
  DependencyManagerConfig 
} from './DependencyManager'

export {
  redundancyDependencies,
  developmentDependencies,
  enhancementDependencies,
  getAllDependencies,
  getRequiredDependencies,
  getOptionalDependencies
} from './RedundancyDependencies'

// Create and configure singleton dependency manager
import { RedundancyDependencyManager } from './DependencyManager'
import { getAllDependencies } from './RedundancyDependencies'

export const redundancyDependencyManager = new RedundancyDependencyManager({
  autoResolve: true,
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  failureStrategy: 'warn'
})

// Register all dependencies
redundancyDependencyManager.registerDependencies(getAllDependencies())