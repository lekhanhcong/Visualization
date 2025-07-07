# Redundancy Feature E2E Tests

End-to-end testing suite for the 2N+1 Redundancy visualization feature using Playwright.

## Overview

This test suite provides comprehensive E2E testing for the redundancy feature, including:

- **Core functionality** - Basic feature operations
- **Integration testing** - Complex scenarios and failover testing  
- **Performance testing** - Load testing and performance validation
- **Framework validation** - Test infrastructure verification

## Quick Start

### Prerequisites

- Node.js 16+ 
- Playwright browsers installed
- Main application running on localhost:3000

### Installation

```bash
# Install Playwright and dependencies
npm install
npm run install

# Install browser dependencies (if needed)
npm run install:deps
```

### Running Tests

```bash
# Run all tests
npm test

# Run with browser UI visible
npm run test:headed

# Run in debug mode
npm run test:debug

# Run with Playwright UI
npm run test:ui
```

### Test Categories

```bash
# Core functionality tests
npm run test:core

# Integration tests (failover scenarios)
npm run test:integration

# Performance and load tests
npm run test:performance

# Framework validation tests
npm run test:framework
```

### Browser-Specific Testing

```bash
# Chrome/Chromium
npm run test:browser:chrome

# Firefox
npm run test:browser:firefox

# Safari/WebKit
npm run test:browser:safari

# Mobile testing
npm run test:mobile
```

### Test Filtering

```bash
# Smoke tests only
npm run test:smoke

# Regression tests
npm run test:regression

# Critical path tests
npm run test:critical
```

## Test Structure

```
e2e/
├── tests/
│   ├── redundancy-core/           # Core functionality tests
│   ├── redundancy-integration/    # Integration scenarios
│   ├── redundancy-performance/    # Performance tests
│   ├── framework-validation/      # Test framework validation
│   ├── browser/                   # Browser-specific tests
│   └── mobile/                    # Mobile-specific tests
├── helpers/
│   ├── page-objects.js           # Page object models
│   └── test-utils.js             # Test utilities
├── setup/
│   ├── global-setup.js           # Global test setup
│   └── global-teardown.js        # Global test teardown
├── data/                         # Test data and fixtures
├── auth/                         # Authentication states
└── test-results/                 # Test outputs and artifacts
```

## Page Objects

The test suite uses the Page Object Model for maintainable tests:

### MainPage
- Application navigation and setup
- Feature toggling
- Error detection

### RedundancyPage  
- Redundancy overlay interactions
- Substation and line operations
- Info panel verification
- Settings management

### PerformancePage
- Performance monitoring
- Metrics collection
- Memory usage tracking

## Test Data

Test data is managed through JSON fixtures:

```javascript
// Load test scenarios
const scenarios = testData.getScenarios()

// Load test substations
const substations = testData.getSubstations()

// Load test transmission lines
const lines = testData.getLines()
```

## Test Utilities

Comprehensive utility functions for common operations:

### Assertions
- `assertVisible()` - Element visibility
- `assertText()` - Text content validation
- `assertCount()` - Element count verification
- `assertAttribute()` - Attribute validation

### Wait Utilities
- `forRedundancyLoad()` - Wait for feature initialization
- `forOverlay()` - Wait for overlay appearance
- `forAnimations()` - Wait for animations to complete
- `forNetwork()` - Wait for network requests

### Screenshot Utilities
- `fullPage()` - Full page screenshots
- `element()` - Element screenshots
- `overlay()` - Redundancy overlay screenshots

## Configuration

### Playwright Configuration

The test suite is configured via `playwright.config.js`:

- **Multiple projects** for different browsers and test types
- **Custom timeouts** for different test categories
- **Artifact collection** (screenshots, videos, traces)
- **Parallel execution** settings
- **Environment configuration**

### Environment Variables

```bash
# Application URL
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Debug options
DEBUG_E2E=true
DEBUG_NETWORK=true

# Setup options
SETUP_AUTH=true
SETUP_MOCKS=true
CLEANUP_TEMP_FILES=true
```

## Test Execution

### Local Development

```bash
# Run core tests in headed mode
npm run local

# Debug specific test
npm run test:debug -- --grep "should display redundancy feature"

# Generate test code interactively
npm run codegen
```

### Continuous Integration

```bash
# CI-optimized test run
npm run ci

# Validation before merge
npm run validate
```

## Test Reports

### HTML Report
```bash
# View detailed HTML report
npm run report
```

### Trace Viewer
```bash
# View execution traces
npm run trace test-results/traces/trace.zip
```

### Screenshots and Videos
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`

## Performance Testing

Performance tests validate:

- **Page load times** - Initial application loading
- **Rendering performance** - Overlay and component rendering
- **Animation performance** - Smooth animations and frame rates
- **Memory usage** - Memory leak detection
- **Interaction responsiveness** - User interaction response times

### Performance Thresholds

- Page load: < 5 seconds
- Overlay rendering: < 2 seconds
- Interaction response: < 500ms
- Animation frame rate: > 30 FPS
- Memory increase: < 50% during extended operation

## Debugging

### Debug Mode
```bash
# Run tests in debug mode with Playwright Inspector
npm run test:debug

# Debug specific test file
npx playwright test tests/redundancy-core/basic-functionality.e2e.js --debug
```

### Trace Analysis
```bash
# Show trace for failed test
npx playwright show-trace test-results/traces/trace.zip
```

### Console Logging
Set `DEBUG_E2E=true` to enable detailed console logging during test execution.

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and independent
- Use proper setup and teardown

### Page Objects
- Keep selectors centralized
- Create reusable interaction methods
- Handle waits and timeouts properly
- Use proper error handling

### Test Data
- Use fixtures for consistent test data
- Avoid hardcoded values
- Create data generators for dynamic tests
- Clean up test data after tests

### Error Handling
- Verify no console errors
- Handle network failures gracefully
- Take screenshots on failures
- Save traces for debugging

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeouts in configuration
- Add explicit waits for slow operations
- Check network conditions

**Screenshots not saving**
- Verify directory permissions
- Check disk space
- Ensure proper configuration

**Authentication issues**
- Verify global setup completed
- Check authentication state files
- Validate feature flags

**Performance test failures**
- Check system resources
- Verify no background processes
- Review performance thresholds

### Getting Help

1. Check test output and error messages
2. Review HTML report for detailed information
3. Analyze traces for execution details
4. Enable debug logging for more information
5. Consult team documentation and knowledge base

## Contributing

When adding new tests:

1. Follow existing patterns and conventions
2. Add appropriate test tags (@smoke, @regression, @critical)
3. Include proper error handling
4. Update documentation as needed
5. Ensure tests are reliable and maintainable