# 2N+1 Redundancy Feature

Professional investor-grade visualization for power infrastructure redundancy.

## Overview

This feature provides a comprehensive visualization of the 2N+1 redundancy system for the Hue Hi Tech Park Data Center, highlighting power lines, substations, and capacity information in an interactive overlay.

## Architecture

Built using Plugin Architecture pattern with zero core application modifications:
- ✅ Complete feature isolation
- ✅ Plugin-based registration
- ✅ Feature flag controlled
- ✅ Zero-impact disable/removal

## Features

### Visual Components
- **Line Highlighting**: 4 power lines with glow effects
  - 2 Active lines (red): Quảng Trạch → Sub 01, Thanh Mỹ → Sub 01
  - 2 Standby lines (yellow): Quảng Trị → Sub 02, Đà Nẵng → Sub 02
- **Substation Markers**: 2 substations with status indicators
- **Info Panel**: Real-time statistics and capacity information
- **Animations**: Sequential reveal with smooth transitions

### Technical Features
- **Responsive Design**: Works on all device sizes
- **Accessibility**: WCAG compliant with screen reader support
- **Performance**: 60fps animations with optimized rendering
- **Cross-browser**: Chrome, Firefox, Safari, Edge support

## Usage

### Feature Flag
```env
NEXT_PUBLIC_ENABLE_REDUNDANCY=true
```

### Integration
```tsx
import { RedundancyProvider, RedundancyButton } from '@/features/redundancy'

export default function App() {
  return (
    <RedundancyProvider>
      <YourApp />
      <RedundancyButton />
    </RedundancyProvider>
  )
}
```

## Development

### Structure
```
features/redundancy/
├── components/          # React components
├── styles/             # CSS with rdx- prefixes
├── utils/              # Utility functions
├── types/              # TypeScript interfaces
├── __tests__/          # Test files
├── config.ts           # Configuration
├── plugin.ts           # Plugin registration
└── index.ts            # Entry point
```

### Testing
```bash
npm test features/redundancy
npm run test:e2e -- --grep "redundancy"
```

### Building
```bash
npm run build
```

## Configuration

See `config.ts` for all configurable options including:
- Colors and visual styling
- Animation timing
- Substation positions
- Line definitions
- Performance settings

## Critical Notes

1. **Coordinate Accuracy**: Substation 02 position must be precisely ~800m SE of Sub 01 within green boundary
2. **Line Identification**: Careful mapping of existing 500kV infrastructure required
3. **Visual Alignment**: Overlay must perfectly align with base map across all screen sizes

## Performance Requirements

- Animation: 60fps maintenance
- Load time: <1s additional impact
- Memory: Efficient cleanup and no leaks
- Bundle: Minimal size increase

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Reduced motion respect
- High contrast support