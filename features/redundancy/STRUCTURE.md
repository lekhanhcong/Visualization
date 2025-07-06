# 2N+1 Redundancy Feature - Folder Structure

## Directory Organization

```
features/redundancy/
├── components/              # React components
│   ├── .gitkeep            # Placeholder for empty directory
│   ├── RedundancyProvider/ # Context provider component
│   ├── RedundancyOverlay/  # Main overlay component
│   ├── RedundancyButton/   # Trigger button component
│   ├── InfoPanel/          # Statistics panel component
│   ├── LineHighlight/      # Power line highlighting
│   ├── SubstationMarker/   # Substation marker components
│   └── PowerFlowAnimation/ # Animation components
├── styles/                 # CSS files with rdx- prefixes
│   ├── base.css           # Base styles and variables
│   ├── components.css     # Component-specific styles
│   ├── animations.css     # Animation definitions
│   └── responsive.css     # Responsive design styles
├── utils/                 # Utility functions
│   ├── .gitkeep          # Placeholder for empty directory
│   ├── env.ts            # Environment variable utilities
│   ├── coordinates.ts    # Coordinate transformation
│   ├── animations.ts     # Animation helpers
│   └── validation.ts     # Validation utilities
├── __tests__/            # Test files
│   ├── components/       # Component tests
│   ├── utils/           # Utility tests
│   └── integration/     # Integration tests
├── types.ts             # TypeScript type definitions
├── config.ts            # Feature configuration
├── plugin.ts            # Plugin registration logic
├── index.ts             # Main entry point
├── package.json         # Feature package configuration
├── tsconfig.json        # TypeScript configuration
├── README.md            # Feature documentation
├── .gitignore          # Feature-specific ignore patterns
└── STRUCTURE.md        # This file
```

## Component Organization

Each component follows a consistent structure:

```
ComponentName/
├── index.tsx           # Main component export
├── ComponentName.tsx   # Component implementation
├── ComponentName.test.tsx # Component tests
├── ComponentName.stories.tsx # Storybook stories (if applicable)
├── hooks/             # Component-specific hooks
├── utils/             # Component-specific utilities
└── styles.css         # Component styles (with rdx- prefix)
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `RedundancyOverlay.tsx`)
- **Utilities**: camelCase (e.g., `coordinateUtils.ts`)
- **Tests**: Same as source + `.test.ts` (e.g., `RedundancyOverlay.test.tsx`)
- **Styles**: kebab-case (e.g., `redundancy-overlay.css`)
- **Types**: camelCase with descriptive names (e.g., `redundancyTypes.ts`)

## Import/Export Patterns

### Barrel Exports
Main `index.ts` acts as a barrel export for clean imports:
```typescript
export { RedundancyProvider } from './components/RedundancyProvider'
export type { RedundancyConfig } from './types'
```

### Internal Imports
Use relative imports within the feature:
```typescript
import { redundancyConfig } from '../config'
import type { RedundancyState } from '../types'
```

### External Imports
Use absolute imports for core app dependencies:
```typescript
import { useImageMap } from '@/hooks/useImageMap'
import type { ImageHotspot } from '@/types'
```

## Development Guidelines

1. **Isolation**: All feature code must be self-contained
2. **Prefixing**: All CSS classes use `rdx-` prefix
3. **Testing**: Each component and utility must have tests
4. **Documentation**: All public APIs must be documented
5. **Performance**: Optimize for 60fps animations and minimal bundle impact

## Build Process

The feature uses the main app's build process but has its own TypeScript configuration for type checking and development isolation.

## Version Control

- Feature development happens in feature branches
- All changes are tracked in the main repository
- Feature can be completely removed by deleting this directory
- No core application files are modified