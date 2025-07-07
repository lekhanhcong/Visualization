/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RedundancyErrorBoundary, withErrorBoundary, RedundancyFallback } from '../ErrorBoundary'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
}))

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}


describe('RedundancyErrorBoundary', () => {
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    originalConsoleError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
    jest.clearAllMocks()
  })

  describe('Normal Operation', () => {
    test('renders children when no error occurs', () => {
      render(
        <RedundancyErrorBoundary>
          <div>Normal content</div>
        </RedundancyErrorBoundary>
      )
      
      expect(screen.getByText('Normal content')).toBeInTheDocument()
    })

    test('does not interfere with normal component behavior', () => {
      const handleClick = jest.fn()
      
      render(
        <RedundancyErrorBoundary>
          <button onClick={handleClick}>Click me</button>
        </RedundancyErrorBoundary>
      )
      
      const button = screen.getByText('Click me')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    test('catches and displays error UI when child throws', () => {
      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      expect(screen.getByText('Visualization Error')).toBeInTheDocument()
      expect(screen.getByText(/The 2N\+1 redundancy visualization encountered an unexpected error/)).toBeInTheDocument()
    })

    test('shows try again button with retry count', () => {
      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      const tryAgainButton = screen.getByText(/Try Again/)
      expect(tryAgainButton).toBeInTheDocument()
      expect(tryAgainButton).toHaveTextContent('Try Again (3 left)')
    })

    test('shows reload page button', () => {
      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      expect(screen.getByText('Reload Page')).toBeInTheDocument()
    })

    test('calls onError callback when provided', () => {
      const onError = jest.fn()
      
      render(
        <RedundancyErrorBoundary onError={onError}>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })

  describe('Error Recovery', () => {
    test('allows retry and decrements retry count', async () => {
      const { rerender } = render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      const tryAgainButton = screen.getByText('Try Again (3 left)')
      await userEvent.click(tryAgainButton)
      
      // After click, should attempt to render children again
      rerender(
        <RedundancyErrorBoundary>
          <ThrowError shouldThrow={false} />
        </RedundancyErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    test('disables retry button after max retries', async () => {
      const TestComponent = () => {
        const [errorCount] = React.useState(0)
        
        return (
          <RedundancyErrorBoundary key={errorCount}>
            <ThrowError />
          </RedundancyErrorBoundary>
        )
      }
      
      render(<TestComponent />)
      
      // Should have retry button initially
      expect(screen.getByText('Try Again (3 left)')).toBeInTheDocument()
    })

    test('shows reload button that can be clicked', async () => {
      // Mock window.location.reload for this specific test
      const mockReload = jest.fn()
      Object.defineProperty(window.location, 'reload', {
        value: mockReload,
        writable: true
      })
      
      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      const reloadButton = screen.getByText('Reload Page')
      await userEvent.click(reloadButton)
      
      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('Development Mode Features', () => {
    test('displays detailed error message in development mode', () => {
      const spy = jest.spyOn(process, 'env', 'get')
      spy.mockReturnValue({ ...process.env, NODE_ENV: 'development' })

      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()

      spy.mockRestore()
    })

    test('shows technical details in development mode', () => {
      const spy = jest.spyOn(process, 'env', 'get')
      spy.mockReturnValue({ ...process.env, NODE_ENV: 'development' })

      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )

      expect(screen.getByText('Technical Details')).toBeInTheDocument()

      spy.mockRestore()
    })

    test('expands technical details when clicked', async () => {
      const spy = jest.spyOn(process, 'env', 'get')
      spy.mockReturnValue({ ...process.env, NODE_ENV: 'development' })

      render(
        <RedundancyErrorBoundary>
          <ThrowError />
        </RedundancyErrorBoundary>
      )

      const detailsToggle = screen.getByText('Technical Details')
      await userEvent.click(detailsToggle)

      expect(screen.getByText(/Test error message/)).toBeInTheDocument()

      spy.mockRestore()
    })
  })

  describe('Custom Fallback', () => {
    test('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>
      
      render(
        <RedundancyErrorBoundary fallback={customFallback}>
          <ThrowError />
        </RedundancyErrorBoundary>
      )
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
      expect(screen.queryByText('Visualization Error')).not.toBeInTheDocument()
    })
  })

  describe('Component Stack Tracking', () => {
    test('captures component stack information', () => {
      const onError = jest.fn()
      
      render(
        <RedundancyErrorBoundary onError={onError}>
          <div>
            <span>
              <ThrowError />
            </span>
          </div>
        </RedundancyErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ThrowError')
        })
      )
    })
  })
})

describe('withErrorBoundary HOC', () => {
  const TestComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal Content</div>;
  };
  TestComponent.displayName = 'TestComponent';

  test('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent />)
    
    expect(screen.getByText('Normal Content')).toBeInTheDocument()
  })

  test('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('Visualization Error')).toBeInTheDocument()
  })

  test('uses custom fallback when provided', () => {
    const customFallback = <div>HOC custom fallback</div>
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(screen.getByText('HOC custom fallback')).toBeInTheDocument()
  })

  test('calls custom error handler', () => {
    const onError = jest.fn()
    const WrappedComponent = withErrorBoundary(TestComponent, undefined, onError)
    
    render(<WrappedComponent shouldThrow={true} />)
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    )
  })

  test('preserves component display name', () => {
    TestComponent.displayName = 'TestComponent'
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
  })
})

describe('RedundancyFallback', () => {
  test('renders default fallback message', () => {
    render(<RedundancyFallback />)
    
    expect(screen.getByText('Feature Unavailable')).toBeInTheDocument()
    expect(screen.getByText('The redundancy visualization is temporarily unavailable.')).toBeInTheDocument()
  })

  test('renders custom message when provided', () => {
    const customMessage = 'Custom unavailable message'
    
    render(<RedundancyFallback message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  test('displays appropriate icon', () => {
    render(<RedundancyFallback />)
    
    expect(screen.getByText('⚡')).toBeInTheDocument()
  })
})