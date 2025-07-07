/**
 * Component Testing Utilities
 * Specialized utilities for testing React components in the redundancy feature
 */

import React from 'react'
import { render, RenderResult, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

/**
 * Component wrapper with redundancy context
 */
interface ComponentWrapperProps {
  children: React.ReactNode
  redundancyContext?: any
  themeContext?: any
  routerContext?: any
}

export function ComponentWrapper({ 
  children, 
  redundancyContext = {},
  themeContext = {},
  routerContext = {}
}: ComponentWrapperProps) {
  return React.createElement('div', {
    'data-testid': 'component-wrapper',
    'data-redundancy-context': JSON.stringify(redundancyContext),
    'data-theme-context': JSON.stringify(themeContext),
    'data-router-context': JSON.stringify(routerContext)
  }, children)
}

/**
 * Enhanced render function for redundancy components
 */
interface RenderComponentOptions {
  redundancyProps?: any
  wrapperProps?: Partial<ComponentWrapperProps>
  renderOptions?: any
}

export function renderRedundancyComponent(
  component: React.ReactElement,
  options: RenderComponentOptions = {}
): RenderResult {
  const { redundancyProps = {}, wrapperProps = {}, renderOptions = {} } = options

  const WrappedComponent = React.createElement(ComponentWrapper, wrapperProps, 
    React.cloneElement(component, redundancyProps)
  )

  return render(WrappedComponent, renderOptions)
}

/**
 * Component testing utilities
 */
export const componentTestUtils = {
  /**
   * Wait for component to be fully mounted
   */
  waitForMount: async (container: HTMLElement, timeout = 1000) => {
    return waitFor(
      () => {
        const element = container.querySelector('[data-testid="component-wrapper"]')
        expect(element).toBeInTheDocument()
        return element
      },
      { timeout }
    )
  },

  /**
   * Wait for component animations to complete
   */
  waitForAnimations: async (timeout = 500) => {
    return new Promise(resolve => setTimeout(resolve, timeout))
  },

  /**
   * Get component bounding box
   */
  getBoundingBox: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    }
  },

  /**
   * Trigger resize event on element
   */
  triggerResize: (element: HTMLElement, newSize: { width: number; height: number }) => {
    Object.defineProperty(element, 'offsetWidth', { value: newSize.width })
    Object.defineProperty(element, 'offsetHeight', { value: newSize.height })
    fireEvent(window, new Event('resize'))
  },

  /**
   * Simulate hover interaction
   */
  simulateHover: async (element: HTMLElement) => {
    const user = userEvent.setup()
    await user.hover(element)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
  },

  /**
   * Simulate click interaction
   */
  simulateClick: async (element: HTMLElement) => {
    const user = userEvent.setup()
    await user.click(element)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
  },

  /**
   * Simulate keyboard interaction
   */
  simulateKeyboard: async (keys: string) => {
    const user = userEvent.setup()
    await user.keyboard(keys)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
  },

  /**
   * Assert component has correct CSS class
   */
  assertHasClass: (element: HTMLElement, className: string) => {
    expect(element).toHaveClass(`rdx-${className}`)
  },

  /**
   * Assert component has correct attributes
   */
  assertHasAttributes: (element: HTMLElement, attributes: Record<string, string>) => {
    Object.entries(attributes).forEach(([key, value]) => {
      expect(element).toHaveAttribute(key, value)
    })
  },

  /**
   * Assert component is accessible
   */
  assertAccessible: (element: HTMLElement) => {
    // Check for required accessibility attributes
    const role = element.getAttribute('role')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    
    expect(role || ariaLabel || ariaLabelledBy).toBeTruthy()
  },

  /**
   * Get computed styles
   */
  getComputedStyles: (element: HTMLElement) => {
    return window.getComputedStyle(element)
  },

  /**
   * Assert component is responsive
   */
  assertResponsive: async (element: HTMLElement, breakpoints: number[]) => {
    for (const breakpoint of breakpoints) {
      componentTestUtils.triggerResize(element, { width: breakpoint, height: 600 })
      await componentTestUtils.waitForAnimations(100)
      expect(element).toBeVisible()
    }
  }
}

/**
 * Event testing utilities
 */
export const eventTestUtils = {
  /**
   * Create mock mouse event
   */
  createMouseEvent: (type: string, options: any = {}) => {
    return new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100,
      ...options
    })
  },

  /**
   * Create mock keyboard event
   */
  createKeyboardEvent: (type: string, key: string, options: any = {}) => {
    return new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      key,
      code: `Key${key.toUpperCase()}`,
      ...options
    })
  },

  /**
   * Create mock touch event
   */
  createTouchEvent: (type: string, touches: any[] = []) => {
    return new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: touches.map(touch => ({
        identifier: 0,
        target: document.body,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1,
        ...touch
      }))
    })
  },

  /**
   * Dispatch custom event
   */
  dispatchCustomEvent: (element: HTMLElement, eventName: string, detail: any = {}) => {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail
    })
    element.dispatchEvent(event)
  }
}

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => RenderResult) => {
    const startTime = performance.now()
    const result = renderFn()
    await componentTestUtils.waitForMount(result.container)
    const endTime = performance.now()
    
    return {
      renderTime: endTime - startTime,
      result
    }
  },

  /**
   * Measure animation performance
   */
  measureAnimationPerformance: async (element: HTMLElement, animationDuration = 1000) => {
    const frames: number[] = []
    let lastTime = performance.now()
    
    const measureFrame = () => {
      const currentTime = performance.now()
      frames.push(currentTime - lastTime)
      lastTime = currentTime
      
      if (frames.length * 16 < animationDuration) {
        requestAnimationFrame(measureFrame)
      }
    }
    
    requestAnimationFrame(measureFrame)
    
    await new Promise(resolve => setTimeout(resolve, animationDuration))
    
    const avgFrameTime = frames.reduce((sum, time) => sum + time, 0) / frames.length
    const fps = 1000 / avgFrameTime
    
    return {
      avgFrameTime,
      fps,
      frameCount: frames.length,
      droppedFrames: frames.filter(time => time > 16.67).length
    }
  },

  /**
   * Measure memory usage
   */
  measureMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      }
    }
    return null
  }
}

/**
 * Accessibility testing utilities
 */
export const a11yTestUtils = {
  /**
   * Check if element is keyboard navigable
   */
  isKeyboardNavigable: (element: HTMLElement) => {
    const tabIndex = element.getAttribute('tabindex')
    const role = element.getAttribute('role')
    const tagName = element.tagName.toLowerCase()
    
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a']
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option']
    
    return (
      tabIndex === '0' ||
      interactiveElements.includes(tagName) ||
      (role && interactiveRoles.includes(role))
    )
  },

  /**
   * Check if element has proper ARIA labels
   */
  hasProperLabeling: (element: HTMLElement) => {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    const ariaDescribedBy = element.getAttribute('aria-describedby')
    const title = element.getAttribute('title')
    
    return !!(ariaLabel || ariaLabelledBy || ariaDescribedBy || title)
  },

  /**
   * Check color contrast (mock implementation for testing)
   */
  checkColorContrast: (element: HTMLElement) => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor
    
    // Mock contrast calculation - in real implementation would use proper contrast algorithm
    return {
      foreground: color,
      background: backgroundColor,
      ratio: 4.5, // Mock ratio that passes WCAG AA
      passes: true
    }
  },

  /**
   * Check if element supports screen readers
   */
  supportsScreenReaders: (element: HTMLElement) => {
    const role = element.getAttribute('role')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    const ariaHidden = element.getAttribute('aria-hidden')
    
    return !!(role || ariaLabel || ariaLabelledBy) && ariaHidden !== 'true'
  }
}

/**
 * Visual testing utilities
 */
export const visualTestUtils = {
  /**
   * Compare element screenshots (mock implementation)
   */
  compareScreenshot: async (element: HTMLElement, baselineImage: string) => {
    // Mock implementation - in real scenario would use visual regression testing tools
    const elementRect = element.getBoundingClientRect()
    
    return {
      match: true,
      difference: 0,
      dimensions: {
        width: elementRect.width,
        height: elementRect.height
      }
    }
  },

  /**
   * Capture element as data URL
   */
  captureElement: async (element: HTMLElement) => {
    // Mock implementation
    return 'data:image/png;base64,mockbase64data'
  },

  /**
   * Check element positioning
   */
  checkElementPosition: (element: HTMLElement, expectedPosition: { x: number; y: number }) => {
    const rect = element.getBoundingClientRect()
    const tolerance = 1
    
    return {
      x: Math.abs(rect.x - expectedPosition.x) <= tolerance,
      y: Math.abs(rect.y - expectedPosition.y) <= tolerance,
      actual: { x: rect.x, y: rect.y },
      expected: expectedPosition
    }
  }
}

export default {
  ComponentWrapper,
  renderRedundancyComponent,
  componentTestUtils,
  eventTestUtils,
  performanceTestUtils,
  a11yTestUtils,
  visualTestUtils
}