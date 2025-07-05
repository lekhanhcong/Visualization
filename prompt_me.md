# Prompt Me - Hue Hi Tech Park 300MW AI Data Center Visualization

## Project Summary
**Interactive Power Infrastructure Visualization for Hue Hi Tech Park's 300MW AI Data Center**

This NextJS application provides a comprehensive, interactive visualization of the power infrastructure supporting Vietnam's largest AI data center facility located in Hue Hi Tech Park.

## Quick Context for AI Assistants

### What This Project Does
- **Primary Purpose**: Interactive visualization of power infrastructure for a 300MW AI data center
- **Key Visual**: Displays Power.png with interactive hotspots and legend
- **Target Users**: Infrastructure engineers, facility managers, and stakeholders
- **Technology**: Next.js 15 + TypeScript + Tailwind CSS + Framer Motion

### Key Infrastructure Components
1. **300MW AI Data Center** (Primary facility - Green markers)
2. **500/220kV Substation** (High voltage - 2x600MVA)
3. **110kV La Son Substation** (Medium voltage - 40MVA) 
4. **Tả Trạch Hydro Power Plant** (Renewable - 2x10.5MW)

### Power Line Color Coding
- **500kV Lines**: Red (#ef4444) - High voltage transmission
- **220kV Lines**: Blue (#3b82f6) - Medium voltage transmission  
- **110kV Lines**: Pink (#ec4899) - Distribution voltage
- **Data Center Connection**: Green (#10b981) - Main facility

## Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Project Structure Quick Reference
```
src/
├── app/                    # Next.js 15 App Router
├── components/             # Atomic design pattern
│   ├── atoms/             # Basic UI elements
│   ├── molecules/         # Component combinations
│   ├── organisms/         # Complex components
│   └── templates/         # Page layouts
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── stores/                # Zustand state management
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions

public/
├── images/
│   └── Power.png          # Main infrastructure map
└── data/                  # JSON configuration files
```

## Common Issues & Solutions

### React Infinite Loop Fix
If you encounter "Maximum update depth exceeded":
```typescript
// In ThemeContext.tsx - Fixed version
useEffect(() => {
  const handleChange = (e: MediaQueryListEvent) => {
    setSystemTheme(e.matches ? 'dark' : 'light')
    // Don't call setTheme here - causes infinite loop
  }
  // ... rest of implementation
}, []) // Empty dependency array
```

### Key Files to Understand
- `src/app/page.tsx` - Main visualization page with Power.png display
- `src/contexts/ThemeContext.tsx` - Theme management (fixed infinite loop)
- `src/components/molecules/LegendPanel.tsx` - Interactive legend
- `public/data/hotspots.json` - Infrastructure hotspot coordinates

## Testing Infrastructure

### Test Coverage
- **Unit Tests**: 246 test cases
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows with Playwright
- **Performance Tests**: Load time and Web Vitals monitoring

### Key Test Files
```
tests/
├── unit/                  # Jest + React Testing Library
├── e2e/                   # Playwright E2E tests
└── css-properties.spec.ts # CSS validation tests
```

## Repository Information
- **GitHub**: https://github.com/lekhanhcong/Power
- **Main Branch**: main
- **Language Breakdown**: TypeScript 96.5%, JavaScript 1.9%, CSS 1.6%
- **Total Files**: 300+ source files
- **Status**: ✅ 100% Complete and Production Ready

## For Future Development

### Adding New Infrastructure Components
1. Update `public/data/hotspots.json` with new coordinates
2. Add component details to `public/data/infrastructure-details.json`
3. Create corresponding UI components in `src/components/`
4. Update legend colors if needed

### Performance Optimization
- Images are optimized with Next.js Image component
- Components use React.memo for performance
- Bundle size is monitored and optimized
- Code splitting implemented for large components

### Security Features
- Content Security Policy headers configured
- XSS protection measures implemented
- HTTPS-only connections enforced
- No sensitive data exposure

## CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Security Scanning**: CodeQL and dependency audits
- **Multi-Node Testing**: Node.js 18.x and 20.x
- **Deployment**: Automated to GitHub Pages on main branch

---

**Last Updated**: July 5, 2025  
**Project Status**: Production Ready ✅  
**Completion**: 100%  
**Repository**: https://github.com/lekhanhcong/Power