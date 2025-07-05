<<<<<<< HEAD
# Hue Hi Tech Park - 300MW AI Data Center Visualization

Interactive visualization website for the 300MW AI Data Center infrastructure at Hue Hi Tech Park, Vietnam.

## 🎯 Project Overview

This project provides an interactive map visualization of the data center infrastructure, including power transmission lines, substations, and renewable energy sources. Built with modern web technologies for optimal performance and user experience.

## 🛠️ Technology Stack

### Core Framework

- **Next.js 14+** with App Router and Server Components
- **TypeScript 5.0+** with strict mode configuration
- **React 18+** with concurrent features
- **Tailwind CSS 3.4+** with custom design system

### State Management & Data

- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Context** for theme management
- **JSON files** for static data storage

### Animations & UI

- **Framer Motion 10+** for smooth animations
- **Radix UI Primitives** for accessible base components
- **shadcn/ui** component library
- **Lucide React** for consistent iconography

### Testing & Quality

- **Playwright** for E2E testing with MCP integration
- **Jest** for unit testing
- **React Testing Library** for component testing
- **ESLint + Prettier** for code quality

### Performance & Optimization

- **Next.js Image** optimization with Sharp
- **Web Vitals** monitoring
- **Bundle Analyzer** for optimization
- **Code splitting** strategies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hue-datacenter-visualization
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Export static files
npm run export
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Composed components
│   ├── organisms/         # Complex sections
│   ├── templates/         # Page layouts
│   └── ui/               # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── providers/             # React providers
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
└── utils/                # Utility functions

public/
├── data/                 # Static JSON data
│   ├── hotspots.json     # Infrastructure hotspots
│   ├── image-config.json # Image configuration
│   └── infrastructure-details.json # Detailed info
└── images/               # Static assets
    └── Power.png         # Base infrastructure map
```

## 🗺️ Infrastructure Components

### Main Infrastructure Points

1. **300MW AI Data Center** - Primary computing facility
2. **500/220kV Substation** - High voltage transformation (2x600MVA)
3. **110kV La Son Substation** - Medium voltage distribution (40MVA)
4. **Tả Trạch Hydro Power Plant** - Renewable energy source (2x10.5MW)

### Power Lines Color Coding

- **500kV Lines**: Red (#ef4444) - High voltage transmission
- **220kV Lines**: Blue (#3b82f6) - Medium voltage transmission
- **110kV Lines**: Pink (#ec4899) - Distribution voltage
- **Data Center**: Green (#10b981) - Main facility

## 🎨 Features

### Interactive Map

- **Zoom & Pan**: Mouse wheel and drag support
- **Touch Gestures**: Mobile-friendly interactions
- **Hotspot Markers**: Clickable infrastructure points
- **Responsive Design**: Adapts to all screen sizes

### Information System

- **Detailed Modals**: Complete infrastructure specifications
- **Tooltips**: Quick information on hover
- **Legend Panel**: Color coding reference
- **Real-time Data**: Dynamic content loading

### Theme System

- **Light/Dark Modes**: User preference support
- **System Theme**: Automatic OS detection
- **Persistent Storage**: Remembers user choice
- **Smooth Transitions**: Animated theme switching

### Performance

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports for performance
- **Web Vitals Monitoring**: Real-time performance metrics
- **Bundle Analysis**: Size optimization tools

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test basic.spec.ts

# Run with UI
npx playwright test --ui

# Generate test report
npx playwright show-report
```

### Unit Testing with Jest

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Types

- **Component Tests**: React Testing Library
- **Hook Tests**: Custom hook functionality
- **Type Tests**: TypeScript interface validation
- **E2E Tests**: Full user workflows
- **Performance Tests**: Load time and metrics

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run analyze      # Bundle size analysis
```

### Code Quality

- **ESLint**: TypeScript and React rules
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for quality checks
- **Commitlint**: Conventional commit messages
- **lint-staged**: Pre-commit file linting

### Environment Variables

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-ga-id
```

## 📊 Performance Metrics

### Target Performance

- **Load Time**: < 2 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Bundle Sizes

- **Main Bundle**: ~160KB (gzipped)
- **Image Assets**: Optimized with Next.js Image
- **Code Splitting**: Dynamic imports for large components
- **Tree Shaking**: Unused code elimination

## 🌐 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large**: 1440px+

### Features by Device

- **Mobile**: Touch gestures, simplified UI
- **Tablet**: Optimal layout for medium screens
- **Desktop**: Full feature set with hover states

## 🔒 Security

### Implemented Measures

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Input sanitization
- **HTTPS Only**: Secure connections
- **No Inline Scripts**: External script sources only

## 🚀 Deployment

### Static Export

```bash
npm run build
npm run export
```

### Vercel Deployment

```bash
npx vercel
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

1. **Development**: Local development server
2. **Staging**: Preview deployments
3. **Production**: Optimized production build

## 📈 Monitoring

### Performance Monitoring

- **Web Vitals**: Real-time metrics in development
- **Bundle Analysis**: Regular size monitoring
- **Error Tracking**: Console error logging
- **Performance Budget**: Size limits enforcement

### Analytics Integration

- **Google Analytics**: Page views and interactions
- **Performance API**: Browser performance data
- **User Behavior**: Interaction tracking

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run quality checks
5. Submit pull request

### Code Standards

- **TypeScript**: Strict mode required
- **Testing**: Minimum 80% coverage
- **Documentation**: JSDoc for public APIs
- **Performance**: Bundle size monitoring

## 📞 Support

For technical support or questions:

- **Issues**: GitHub Issues tracker
- **Documentation**: This README and inline docs
- **Performance**: Web Vitals monitoring
- **Testing**: Comprehensive test suite

## 📄 License

This project is proprietary software for Hue Hi Tech Park.

---

**Generated for Hue Hi Tech Park 300MW AI Data Center Visualization Project**

_Last updated: 2025-01-04_
=======
# Power
>>>>>>> fe8a8184d7cdcb92920add68cb3936e96242ab70
