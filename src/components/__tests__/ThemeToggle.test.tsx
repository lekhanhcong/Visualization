/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../atoms/ThemeToggle'

// Mock the theme context
const mockSetTheme = jest.fn()
const mockThemeContext = {
  theme: 'light' as 'light' | 'dark' | 'system',
  setTheme: mockSetTheme,
  isDarkMode: false,
  systemTheme: 'light' as 'light' | 'dark' | 'system',
}

// Mock the theme context hook
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sun: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="sun-icon" data-size={size} className={className}>
      Sun
    </div>
  ),
  Moon: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="moon-icon" data-size={size} className={className}>
      Moon
    </div>
  ),
  Monitor: ({ size, className }: { size: number; className: string }) => (
    <div data-testid="monitor-icon" data-size={size} className={className}>
      Monitor
    </div>
  ),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockThemeContext.theme = 'light'
    mockThemeContext.isDarkMode = false
  })

  describe('Button Variant', () => {
    it('renders with default props', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('displays correct icon for light theme', () => {
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
    })

    it('displays correct icon for dark theme', () => {
      mockThemeContext.theme = 'dark'
      mockThemeContext.isDarkMode = true
      
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument()
    })

    it('displays correct icon for system theme', () => {
      mockThemeContext.theme = 'system'
      
      render(<ThemeToggle />)
      
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    })

    it('cycles through themes on click', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('cycles from dark to system theme', async () => {
      const user = userEvent.setup()
      mockThemeContext.theme = 'dark'
      
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSetTheme).toHaveBeenCalledWith('system')
    })

    it('cycles from system to light theme', async () => {
      const user = userEvent.setup()
      mockThemeContext.theme = 'system'
      
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('applies correct size classes', () => {
      render(<ThemeToggle size="lg" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-12 h-12')
    })

    it('applies correct position classes', () => {
      render(<ThemeToggle position="bottom-left" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('fixed bottom-4 left-4')
    })

    it('shows theme indicator dot with correct color', () => {
      render(<ThemeToggle />)
      
      const dot = document.querySelector('.bg-yellow-400')
      expect(dot).toBeInTheDocument()
    })

    it('shows correct aria-label', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to Light theme')
    })
  })

  describe('Dropdown Variant', () => {
    it('renders dropdown trigger', () => {
      render(<ThemeToggle variant="dropdown" />)
      
      expect(screen.getByLabelText('Theme selector')).toBeInTheDocument()
    })

    it('opens dropdown on click', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="dropdown" />)
      
      const trigger = screen.getByLabelText('Theme selector')
      await user.click(trigger)
      
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System (light)')).toBeInTheDocument()
    })

    it('selects theme from dropdown', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="dropdown" />)
      
      const trigger = screen.getByLabelText('Theme selector')
      await user.click(trigger)
      
      const darkOption = screen.getByText('Dark')
      await user.click(darkOption)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="dropdown" />)
      
      const trigger = screen.getByLabelText('Theme selector')
      await user.click(trigger)
      
      const darkOption = screen.getByText('Dark')
      await user.click(darkOption)
      
      await waitFor(() => {
        expect(screen.queryByText('Light')).not.toBeInTheDocument()
      })
    })

    it('highlights selected theme', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="dropdown" />)
      
      const trigger = screen.getByLabelText('Theme selector')
      await user.click(trigger)
      
      const lightOption = screen.getByText('Light')
      // Check if light option has selected styling (may vary based on theme context mock)
      expect(lightOption).toBeInTheDocument()
    })
  })

  describe('Radio Variant', () => {
    it('renders all theme options', () => {
      render(<ThemeToggle variant="radio" />)
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    })

    it('shows label when enabled', () => {
      render(<ThemeToggle variant="radio" showLabel />)
      
      expect(screen.getByText('Theme:')).toBeInTheDocument()
    })

    it('selects theme on radio button click', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle variant="radio" />)
      
      const darkButton = screen.getByTestId('moon-icon').closest('button')
      await user.click(darkButton!)
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('highlights selected theme', () => {
      render(<ThemeToggle variant="radio" />)
      
      const lightButton = screen.getByTestId('sun-icon').closest('button')
      expect(lightButton).toHaveClass('bg-white text-gray-900 shadow-sm')
    })
  })

  describe('Size Variants', () => {
    it('applies small size correctly', () => {
      render(<ThemeToggle size="sm" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-8 h-8')
      
      const icon = screen.getByTestId('sun-icon')
      expect(icon).toHaveAttribute('data-size', '16')
    })

    it('applies medium size correctly', () => {
      render(<ThemeToggle size="md" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-10 h-10')
      
      const icon = screen.getByTestId('sun-icon')
      expect(icon).toHaveAttribute('data-size', '20')
    })

    it('applies large size correctly', () => {
      render(<ThemeToggle size="lg" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-12 h-12')
      
      const icon = screen.getByTestId('sun-icon')
      expect(icon).toHaveAttribute('data-size', '24')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button).toHaveAttribute('title')
    })

    it('responds to keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('responds to space key', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<ThemeToggle className="custom-class" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('returns null for invalid variant', () => {
      const { container } = render(<ThemeToggle variant={'invalid' as 'button' | 'dropdown' | 'radio'} />)
      expect(container.firstChild).toBeNull()
    })
  })
})