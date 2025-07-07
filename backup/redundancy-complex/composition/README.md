# Component Composition Strategy

## Overview
This document defines the composition rules for the 2N+1 Redundancy feature components to ensure consistent behavior, proper layering, and maintainable architecture.

## Composition Rules

### 1. Layer-Based Composition
Components are organized in distinct layers with defined interaction patterns:

```
Application Layer (z-index: 100+)
├── RedundancyButton (z-index: 200)
├── InfoPanel (z-index: 150)
└── User Interface Controls

Visualization Layer (z-index: 110-140)
├── PowerFlowAnimation (z-index: 120)
├── LineHighlight (z-index: 115)
└── SubstationMarker (z-index: 110)

Base Layer (z-index: 100)
└── RedundancyOverlay (z-index: 100)
```

### 2. Provider Pattern
All components must be wrapped with `RedundancyProvider` to access shared state:

```typescript
<RedundancyProvider enabled={true}>
  <RedundancyOverlay>
    <LineHighlight />
    <SubstationMarker />
    <PowerFlowAnimation />
  </RedundancyOverlay>
  <InfoPanel />
  <RedundancyButton />
</RedundancyProvider>
```

### 3. HOC Composition Rules
Higher-Order Components (HOCs) follow this priority order:

1. **Error Boundaries** (outermost)
2. **Redundancy Feature HOCs** (withRedundancyOverlay, withLineHighlight, etc.)
3. **Utility HOCs** (withDebug, withAnalytics, etc.)
4. **Component** (innermost)

```typescript
export default withErrorBoundary(
  withRedundancyOverlay(
    withLineHighlight(
      withAnalytics(MyComponent)
    )
  )
)
```

### 4. Event Flow
Components communicate through the event bus system:

```
User Interaction → Event Bus → State Update → Component Re-render
```

### 5. State Management
- **Global State**: Managed by RedundancyProvider
- **Local State**: Component-specific state (animation, UI state)
- **Derived State**: Computed from global state (filtered lists, calculated positions)

### 6. Composition Constraints

#### DO:
- Use provider pattern for shared state access
- Implement proper z-index layering
- Follow event-driven architecture
- Isolate component concerns
- Use HOCs for cross-cutting concerns
- Implement error boundaries at component level

#### DON'T:
- Access DOM directly across components
- Share component-specific state via props drilling
- Violate layer boundaries (visualization components accessing application layer)
- Implement business logic in presentation components
- Create circular dependencies between components

### 7. Component Lifecycle
1. **Mount**: Resolve dependencies → Initialize state → Register events
2. **Update**: Process state changes → Update visualizations → Emit events
3. **Unmount**: Cleanup events → Cancel animations → Release resources

## Testing Strategy
- Unit tests for individual components
- Integration tests for component interactions
- E2E tests for complete user workflows
- Performance tests for animation-heavy components

## Performance Guidelines
- Use React.memo for expensive re-renders
- Implement virtualization for large datasets
- Optimize animation loops with requestAnimationFrame
- Use CSS transforms for GPU acceleration
- Lazy load components when possible