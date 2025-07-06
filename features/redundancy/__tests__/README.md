# Redundancy Feature Tests

This directory contains all tests for the 2N+1 Redundancy feature components organized by category.

## Directory Structure

```
__tests__/
├── components/          # Component-specific tests
│   ├── RedundancyOverlay.test.tsx
│   ├── LineHighlight.test.tsx
│   ├── SubstationMarker.test.tsx
│   ├── PowerFlowAnimation.test.tsx
│   ├── InfoPanel.test.tsx
│   └── RedundancyButton.test.tsx
├── providers/           # Provider and context tests
│   └── RedundancyProvider.test.tsx
├── utils/              # Utility function tests
│   ├── component-utils.test.ts
│   ├── component-helpers.test.tsx
│   └── env.test.ts
├── integration/        # Integration tests
│   ├── component-composition.test.tsx
│   ├── event-flow.test.tsx
│   └── state-management.test.tsx
├── performance/        # Performance tests
│   ├── render-performance.test.tsx
│   ├── animation-performance.test.tsx
│   └── memory-usage.test.tsx
├── accessibility/      # Accessibility tests
│   ├── keyboard-navigation.test.tsx
│   ├── screen-reader.test.tsx
│   └── color-contrast.test.tsx
├── visual/            # Visual regression tests
│   ├── component-snapshots.test.tsx
│   └── layout-snapshots.test.tsx
└── e2e/               # End-to-end test specs
    ├── redundancy-workflow.test.ts
    ├── user-interactions.test.ts
    └── error-scenarios.test.ts
```

## Test Categories

### Unit Tests
- **Components**: Individual component behavior and rendering
- **Providers**: Context providers and state management
- **Utils**: Utility functions and helpers

### Integration Tests
- **Component Composition**: Multiple components working together
- **Event Flow**: Event handling and communication between components
- **State Management**: Global state updates and synchronization

### Performance Tests
- **Render Performance**: Component rendering speed and optimization
- **Animation Performance**: Animation frame rates and smoothness
- **Memory Usage**: Memory leaks and cleanup

### Accessibility Tests
- **Keyboard Navigation**: Tab order and keyboard interactions
- **Screen Reader**: ARIA labels and screen reader compatibility
- **Color Contrast**: Color accessibility and high contrast mode

### Visual Tests
- **Component Snapshots**: Visual regression testing
- **Layout Snapshots**: Layout and positioning validation

### End-to-End Tests
- **Redundancy Workflow**: Complete user workflows
- **User Interactions**: Real user interaction scenarios
- **Error Scenarios**: Error handling and recovery

## Test Naming Conventions

- **Unit tests**: `ComponentName.test.tsx` or `utilityName.test.ts`
- **Integration tests**: `feature-name.test.tsx`
- **Performance tests**: `performance-aspect.test.tsx`
- **Accessibility tests**: `accessibility-aspect.test.tsx`
- **Visual tests**: `visual-aspect.test.tsx`
- **E2E tests**: `workflow-name.test.ts`

## Running Tests

```bash
# Run all redundancy tests
npm test features/redundancy

# Run specific test category
npm test features/redundancy/__tests__/components
npm test features/redundancy/__tests__/integration
npm test features/redundancy/__tests__/performance

# Run specific test file
npm test RedundancyOverlay.test.tsx

# Run tests with coverage
npm test -- --coverage features/redundancy

# Run tests in watch mode
npm test -- --watch features/redundancy
```

## Test Configuration

Tests use the redundancy-specific Jest configuration located at:
`features/redundancy/testing/jest.config.js`

This configuration includes:
- Custom test matchers for redundancy components
- Mock implementations for dependencies
- Performance thresholds and monitoring
- Coverage requirements (80% minimum)

## Writing Tests

When writing new tests:

1. Use the testing utilities from `features/redundancy/testing/utils.tsx`
2. Follow the established naming conventions
3. Include both positive and negative test cases
4. Test error conditions and edge cases
5. Ensure tests are deterministic and isolated
6. Add performance tests for animation-heavy components
7. Include accessibility tests for interactive components

## Mock Data

Test data factories are available in the testing utilities:
- `createMockLineData()` - Creates mock transmission line data
- `createMockSubstationData()` - Creates mock substation data
- `createMockCoordinateSystem()` - Creates mock coordinate system
- `mockLines` and `mockSubstations` - Pre-built collections

## Continuous Integration

Tests are automatically run on:
- Pull request creation and updates
- Commits to main branch
- Nightly builds for comprehensive testing

Test results and coverage reports are published to:
- `coverage/redundancy/html/report.html` - HTML coverage report
- `coverage/redundancy/test-report.json` - Detailed test results
- `coverage/redundancy/test-insights.json` - Performance insights