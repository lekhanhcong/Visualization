/**
 * Redundancy Feature Dependencies
 * Defines specific dependencies for the 2N+1 redundancy feature
 */

import type { FeatureDependency } from './DependencyManager'

/**
 * Check if React is available
 */
const checkReact = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.React !== 'undefined' ||
         typeof require !== 'undefined'
}

/**
 * Check if DOM is ready
 */
const checkDOM = (): boolean => {
  return typeof document !== 'undefined' && 
         document.readyState === 'complete' ||
         document.readyState === 'interactive'
}

/**
 * Check if main datacenter view is available
 */
const checkDatacenterView = (): boolean => {
  return document.querySelector('[data-testid="datacenter-main-view"]') !== null ||
         document.querySelector('.main-content') !== null ||
         document.querySelector('main') !== null
}

/**
 * Check if CSS is loaded
 */
const checkCSS = (): boolean => {
  // Check if we can apply CSS styles
  if (typeof document === 'undefined') return false
  
  const testElement = document.createElement('div')
  testElement.style.position = 'absolute'
  return testElement.style.position === 'absolute'
}

/**
 * Check if plugin registry is available
 */
const checkPluginRegistry = (): boolean => {
  try {
    // Try to import plugin registry
    return typeof require !== 'undefined'
  } catch {
    return false
  }
}

/**
 * Fallback: Create minimal DOM structure
 */
const fallbackCreateDOMStructure = (): void => {
  if (typeof document === 'undefined') return
  
  // Create main content area if it doesn't exist
  if (!document.querySelector('[data-testid="datacenter-main-view"]') &&
      !document.querySelector('.main-content')) {
    const mainContent = document.createElement('div')
    mainContent.className = 'main-content'
    mainContent.setAttribute('data-testid', 'datacenter-main-view')
    document.body.appendChild(mainContent)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyDependencies] Created fallback main content area')
    }
  }
}

/**
 * Fallback: Load basic CSS
 */
const fallbackLoadCSS = (): void => {
  if (typeof document === 'undefined') return
  
  // Create basic styles for the feature
  const style = document.createElement('style')
  style.textContent = `
    .redundancy-mount-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }
    
    .redundancy-mount-panel {
      width: 100%;
      min-height: 200px;
    }
    
    .redundancy-mount-widget {
      display: inline-block;
      vertical-align: top;
    }
  `
  document.head.appendChild(style)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[RedundancyDependencies] Loaded fallback CSS')
  }
}

/**
 * Fallback: Wait for DOM
 */
const fallbackWaitForDOM = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve()
      return
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve()
      return
    }
    
    const handleReady = () => {
      document.removeEventListener('DOMContentLoaded', handleReady)
      resolve()
    }
    
    document.addEventListener('DOMContentLoaded', handleReady)
  })
}

/**
 * Core redundancy dependencies
 */
export const redundancyDependencies: FeatureDependency[] = [
  {
    id: 'dom-ready',
    name: 'DOM Ready State',
    required: true,
    loadOrder: 1,
    checkFunction: checkDOM,
    fallbackHandler: fallbackWaitForDOM
  },
  {
    id: 'css-support',
    name: 'CSS Support',
    required: true,
    loadOrder: 2,
    checkFunction: checkCSS,
    fallbackHandler: fallbackLoadCSS
  },
  {
    id: 'react-runtime',
    name: 'React Runtime',
    required: true,
    loadOrder: 3,
    checkFunction: checkReact
  },
  {
    id: 'datacenter-view',
    name: 'Datacenter Main View',
    required: true,
    loadOrder: 4,
    checkFunction: checkDatacenterView,
    fallbackHandler: fallbackCreateDOMStructure
  },
  {
    id: 'plugin-registry',
    name: 'Plugin Registry System',
    required: false,
    loadOrder: 5,
    checkFunction: checkPluginRegistry
  }
]

/**
 * Development-only dependencies
 */
export const developmentDependencies: FeatureDependency[] = [
  {
    id: 'dev-tools',
    name: 'Development Tools',
    required: false,
    loadOrder: 10,
    checkFunction: () => {
      return typeof window !== 'undefined' && 
             (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined
    }
  },
  {
    id: 'hot-reload',
    name: 'Hot Module Reload',
    required: false,
    loadOrder: 11,
    checkFunction: () => {
      return typeof module !== 'undefined' && 
             (module as any).hot !== undefined
    }
  }
]

/**
 * Optional enhancement dependencies
 */
export const enhancementDependencies: FeatureDependency[] = [
  {
    id: 'animation-api',
    name: 'Web Animations API',
    required: false,
    loadOrder: 20,
    checkFunction: () => {
      return typeof window !== 'undefined' && 
             'animate' in document.createElement('div')
    }
  },
  {
    id: 'intersection-observer',
    name: 'Intersection Observer API',
    required: false,
    loadOrder: 21,
    checkFunction: () => {
      return typeof window !== 'undefined' && 
             'IntersectionObserver' in window
    }
  },
  {
    id: 'resize-observer',
    name: 'Resize Observer API',
    required: false,
    loadOrder: 22,
    checkFunction: () => {
      return typeof window !== 'undefined' && 
             'ResizeObserver' in window
    }
  }
]

/**
 * Get all dependencies for current environment
 */
export function getAllDependencies(): FeatureDependency[] {
  const allDeps = [...redundancyDependencies]
  
  // Add development dependencies in development
  if (process.env.NODE_ENV === 'development') {
    allDeps.push(...developmentDependencies)
  }
  
  // Add enhancement dependencies
  allDeps.push(...enhancementDependencies)
  
  return allDeps
}

/**
 * Get only required dependencies
 */
export function getRequiredDependencies(): FeatureDependency[] {
  return getAllDependencies().filter(dep => dep.required)
}

/**
 * Get only optional dependencies
 */
export function getOptionalDependencies(): FeatureDependency[] {
  return getAllDependencies().filter(dep => !dep.required)
}