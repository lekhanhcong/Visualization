# Comprehensive Playwright Testing Framework

This directory contains a comprehensive testing framework for the Next.js 15 React 19 application with TypeScript, specifically designed to test the 2N+1 redundancy visualization feature.

## 📁 Directory Structure

```
tests/
├── accessibility/          # Accessibility (a11y) tests
├── config/                 # Test configuration files
├── e2e/                   # End-to-end tests
├── integration/           # Integration tests
├── performance/           # Performance tests
├── responsive/            # Responsive design tests
├── setup/                 # Test setup and teardown
├── unit/                  # Unit tests (Playwright-based)
├── utils/                 # Test utilities and helpers
└── visual/                # Visual regression tests
```

## 🧪 Test Types

### 1. Unit Tests
- **Location**: `tests/unit/`
- **Purpose**: Test individual components in isolation
- **Example**: `RedundancyVisualization.test.tsx`
- **Run**: `npm run test:unit:playwright`

### 2. Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test component interactions and data flow
- **Example**: `RedundancyVisualization.integration.test.tsx`
- **Run**: `npm run test:integration:playwright`

### 3. End-to-End Tests
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user workflows
- **Example**: `RedundancyVisualization.e2e.spec.ts`
- **Run**: `npm run test:e2e:comprehensive`

### 4. Accessibility Tests
- **Location**: `tests/accessibility/`
- **Purpose**: WCAG compliance and keyboard navigation
- **Example**: `RedundancyVisualization.a11y.spec.ts`
- **Run**: `npm run test:accessibility`

### 5. Performance Tests
- **Location**: `tests/performance/`
- **Purpose**: Load times, memory usage, and animation performance
- **Example**: `RedundancyVisualization.perf.spec.ts`
- **Run**: `npm run test:performance`

### 6. Responsive Design Tests
- **Location**: `tests/responsive/`
- **Purpose**: Cross-device and viewport testing
- **Example**: `RedundancyVisualization.responsive.spec.ts`
- **Run**: `npm run test:responsive`

### 7. Visual Regression Tests
- **Location**: `tests/visual/`
- **Purpose**: Screenshot comparison and visual consistency
- **Run**: `npm run test:visual`

## ⚙️ Configuration Files

### Main Configurations
- `playwright.comprehensive.config.ts` - Complete testing setup with all browsers and devices
- `playwright.coverage.config.ts` - Specialized configuration for coverage collection
- `tests/config/coverage.config.ts` - Coverage thresholds and reporting
- `tests/config/global-setup.ts` - Global test setup
- `tests/config/global-teardown.ts` - Global test cleanup

## 🚀 Getting Started

### Prerequisites
```bash
# Install Playwright browsers
npm run test:install

# Install system dependencies (Linux/CI)
npm run test:install:deps
```

### Quick Start
```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:e2e:comprehensive
npm run test:accessibility
npm run test:performance

# Run with UI for debugging
npm run test:playwright:ui
```

### Development Workflow
```bash
# Watch mode for unit tests
npm run test:local

# Interactive E2E testing
npm run test:local:e2e

# Quick smoke test
npm run test:smoke
```

## 📊 Coverage Reporting

### Generate Coverage Reports
```bash
# Full coverage collection
npm run test:coverage:full

# Specific test type coverage
npm run test:coverage:unit
npm run test:coverage:integration
npm run test:coverage:e2e

# View coverage report
npm run test:show-coverage
```

### Coverage Thresholds
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 🌐 Browser Support

### Desktop Browsers
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari/WebKit (latest)

### Mobile Devices
- Chrome on Android (Pixel 5)
- Safari on iOS (iPhone 12)
- Tablet devices (iPad Pro, Galaxy Tab S4)

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1920px
- **Wide**: 2560px+

## 🎯 Test Categories for RedundancyVisualization

### Animation Testing
- 4-second animation sequence validation
- Animation step progression (lines → substations → connections → info panel)
- Animation interruption and restart handling
- Performance during animations (60fps maintenance)

### User Interaction Testing
- ESC key functionality
- Click interactions (close button, backdrop)
- Touch gestures on mobile devices
- Keyboard navigation and focus management

### Accessibility Testing
- WCAG AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Focus management

### Performance Testing
- Load time measurements
- Animation frame rates
- Memory usage monitoring
- Bundle size impact

### Responsive Testing
- Mobile device compatibility (320px+)
- Tablet layout optimization
- Desktop experience validation
- Ultra-wide screen support (2560px+)

## 🔧 Utilities and Helpers

### TestHelpers Class
Located in `tests/utils/test-helpers.ts`, provides:
- Navigation helpers
- Animation waiting functions
- Assertion utilities
- Performance measurement tools
- Accessibility checking functions

### Usage Example
```typescript
import { TestHelpers } from '../utils/test-helpers'

test('should open redundancy visualization', async ({ page }) => {
  const helpers = new TestHelpers(page)
  
  await helpers.navigateToRedundancyVisualization()
  await helpers.waitForRedundancyVisualization()
  await helpers.waitForAnimationStep(4)
  
  await helpers.assertElementVisible('[role="dialog"]')
})
```

## 📈 CI/CD Integration

### GitHub Actions Workflow
- Parallel test execution across multiple browsers
- Coverage collection and reporting
- Performance budgets enforcement
- Accessibility compliance checking
- Visual regression detection

### Environment Variables
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
NODE_ENV=test
NEXT_PUBLIC_ENABLE_REDUNDANCY=true
CI=true
```

## 🚨 Troubleshooting

### Common Issues

#### Playwright Installation
```bash
# If browsers fail to install
npm run test:doctor
npm run test:install:deps
```

#### Test Failures
```bash
# Debug with UI
npm run test:playwright:debug

# Run with headed browser
npm run test:playwright:headed

# Show test reports
npm run test:show-report
```

#### Coverage Issues
```bash
# Clear coverage data
rm -rf coverage/

# Regenerate coverage
npm run test:coverage:full
```

### Performance Optimization
- Use `test.skip()` for flaky tests during development
- Run tests in parallel when possible
- Use `test.slow()` for performance-critical tests
- Mock heavy dependencies in unit tests

## 📝 Writing New Tests

### Test File Naming Convention
- Unit tests: `*.test.{ts,tsx}`
- Integration tests: `*.test.{ts,tsx}`
- E2E tests: `*.spec.{ts,tsx}`
- Accessibility tests: `*.a11y.spec.{ts,tsx}`
- Performance tests: `*.perf.spec.{ts,tsx}`
- Responsive tests: `*.responsive.spec.{ts,tsx}`
- Visual tests: `*.visual.spec.{ts,tsx}`

### Test Structure Template
```typescript
import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('Feature Name', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.navigateToHome()
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await helpers.navigateToRedundancyVisualization()
    
    // Act
    await helpers.waitForRedundancyVisualization()
    
    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
```

## 📚 Best Practices

### Test Organization
1. Group related tests using `test.describe()`
2. Use meaningful test descriptions
3. Follow AAA pattern (Arrange, Act, Assert)
4. Keep tests independent and isolated

### Performance
1. Use `test.slow()` for long-running tests
2. Avoid unnecessary waits with `page.waitForTimeout()`
3. Use specific selectors over generic ones
4. Mock external dependencies

### Accessibility
1. Test with keyboard navigation
2. Verify ARIA attributes
3. Check color contrast
4. Test with screen readers (axe-core integration)

### Responsive Testing
1. Test critical breakpoints
2. Verify touch targets (44x44px minimum)
3. Check content reflow
4. Test orientation changes

## 🔗 External Dependencies

### Required Packages
- `@playwright/test` - Core testing framework
- `axe-playwright` - Accessibility testing
- `@testing-library/jest-dom` - Additional matchers

### Optional Enhancements
- `playwright-lighthouse` - Performance auditing
- `@percy/playwright` - Visual testing service
- `playwright-aws-lambda` - Cloud testing

## 📄 Documentation References

- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Metrics](https://web.dev/metrics/)

---

For questions or contributions, please refer to the project's main documentation or create an issue in the repository.