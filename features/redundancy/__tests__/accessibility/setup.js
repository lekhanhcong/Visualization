/**
 * Accessibility Test Setup
 * Additional setup for accessibility testing
 */

import { configureAxe } from 'jest-axe'

// Configure axe-core for accessibility testing
const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for testing (as it may not work in jsdom)
    'color-contrast': { enabled: false },
    // Enable other important accessibility rules
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-markup': { enabled: true }
  }
})

// Make axe available globally
global.axe = axe

// Screen reader simulation utilities
global.screenReaderUtils = {
  getAccessibleName: (element) => {
    return element.getAttribute('aria-label') || 
           element.getAttribute('aria-labelledby') ||
           element.textContent ||
           element.getAttribute('title') ||
           ''
  },
  
  getRole: (element) => {
    return element.getAttribute('role') || 
           element.tagName.toLowerCase()
  },
  
  isHidden: (element) => {
    return element.getAttribute('aria-hidden') === 'true' ||
           element.style.display === 'none' ||
           element.style.visibility === 'hidden'
  },
  
  isFocusable: (element) => {
    const tabIndex = element.getAttribute('tabindex')
    return tabIndex !== '-1' && 
           !element.disabled &&
           !global.screenReaderUtils.isHidden(element)
  }
}

// High contrast mode simulation
global.simulateHighContrast = () => {
  const style = document.createElement('style')
  style.textContent = `
    @media (prefers-contrast: high) {
      * {
        filter: contrast(150%) !important;
      }
    }
  `
  document.head.appendChild(style)
  return () => document.head.removeChild(style)
}

// Reduced motion simulation
global.simulateReducedMotion = () => {
  const style = document.createElement('style')
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `
  document.head.appendChild(style)
  return () => document.head.removeChild(style)
}

// Custom accessibility matchers
expect.extend({
  toBeAccessible: async (element) => {
    const results = await axe(element)
    const pass = results.violations.length === 0
    
    return {
      message: () => pass
        ? `Expected element to have accessibility violations`
        : `Expected element to be accessible but found ${results.violations.length} violations:\n${
            results.violations.map(v => `• ${v.description}`).join('\n')
          }`,
      pass,
    }
  },
  
  toHaveAccessibleName: (element, expectedName) => {
    const actualName = global.screenReaderUtils.getAccessibleName(element)
    const pass = actualName === expectedName
    
    return {
      message: () => pass
        ? `Expected element not to have accessible name "${expectedName}"`
        : `Expected element to have accessible name "${expectedName}" but got "${actualName}"`,
      pass,
    }
  },
  
  toBeFocusable: (element) => {
    const pass = global.screenReaderUtils.isFocusable(element)
    
    return {
      message: () => pass
        ? `Expected element not to be focusable`
        : `Expected element to be focusable`,
      pass,
    }
  }
})