# Development Scripts for 2N+1 Redundancy Feature

## Available Scripts

### Development
```bash
# Start development with feature enabled
npm run dev:redundancy

# Start development with feature disabled
npm run dev

# Watch mode for TypeScript compilation
npm run watch:redundancy
```

### Testing
```bash
# Run feature tests
npm run test:redundancy

# Run tests in watch mode
npm run test:redundancy:watch

# Run tests with coverage
npm run test:redundancy:coverage
```

### Building
```bash
# Type check feature code
npm run type-check:redundancy

# Lint feature code
npm run lint:redundancy

# Build feature (type check only)
npm run build:redundancy
```

## Hot Reload Configuration

The feature integrates with Next.js hot reload:

1. **File Watching**: All files in `features/redundancy/` are watched
2. **Component Updates**: React Fast Refresh works for all components
3. **Style Updates**: CSS changes are hot-reloaded
4. **Config Updates**: Configuration changes trigger full reload

## Development Workflow

### 1. Enable Feature
```bash
# Set environment variable
echo "NEXT_PUBLIC_ENABLE_REDUNDANCY=true" > .env.local

# Start development server
npm run dev
```

### 2. Watch TypeScript
```bash
# In separate terminal
cd features/redundancy
npm run type-check -- --watch
```

### 3. Run Tests
```bash
# In separate terminal
npm run test:redundancy:watch
```

### 4. Development Process
1. Make changes to feature files
2. Hot reload updates the browser automatically
3. Tests run automatically (if in watch mode)
4. TypeScript errors show in both terminals

## Environment Setup

### Required Environment Variables
```env
# Enable the feature
NEXT_PUBLIC_ENABLE_REDUNDANCY=true

# Optional: Development mode
NODE_ENV=development
```

### Development URLs
- Main app: http://localhost:3000
- Feature toggle: Look for "Show 2N+1 Redundancy" button
- DevTools: React DevTools for component debugging

## Debugging

### Browser DevTools
1. Open React DevTools
2. Look for "Redundancy" components in tree
3. Inspect props and state
4. Use Console for feature debugging

### VS Code Setup
1. Install recommended extensions:
   - TypeScript Importer
   - CSS Peek
   - ES7+ React/Redux/React-Native snippets
2. Use debugging configuration:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Redundancy Feature",
  "program": "${workspaceFolder}/features/redundancy",
  "env": {
    "NEXT_PUBLIC_ENABLE_REDUNDANCY": "true"
  }
}
```

### Performance Monitoring
1. Use React Profiler for component performance
2. Browser Performance tab for animation performance
3. Network tab for asset loading
4. Memory tab for leak detection

## Common Development Tasks

### Adding New Component
```bash
# Create component directory
mkdir features/redundancy/components/NewComponent

# Create files
touch features/redundancy/components/NewComponent/index.tsx
touch features/redundancy/components/NewComponent/NewComponent.tsx
touch features/redundancy/components/NewComponent/NewComponent.test.tsx

# Add to main index.ts export
# Add to component tests
```

### Adding New Styles
```bash
# Create CSS file with rdx- prefix
touch features/redundancy/styles/new-component.css

# Import in component
# Test responsive behavior
# Verify no conflicts with core app
```

### Testing Changes
```bash
# Unit tests
npm run test:redundancy

# E2E tests
npm run test:e2e -- --grep "redundancy"

# Visual regression
npm run test:visual -- --update-snapshots
```

## Troubleshooting

### Feature Not Showing
1. Check `NEXT_PUBLIC_ENABLE_REDUNDANCY=true` in .env.local
2. Restart development server
3. Clear browser cache
4. Check browser console for errors

### Hot Reload Not Working
1. Check file is in `features/redundancy/` directory
2. Restart development server
3. Check for TypeScript errors
4. Verify file extensions are correct

### TypeScript Errors
1. Run `npm run type-check:redundancy`
2. Check import paths are correct
3. Verify types are exported properly
4. Check tsconfig.json configuration

### Style Issues
1. Verify rdx- prefix is used
2. Check CSS is imported correctly
3. Test in different browsers
4. Verify no conflicts with core styles