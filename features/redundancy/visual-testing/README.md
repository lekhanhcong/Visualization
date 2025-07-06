# Visual Regression Testing

Comprehensive visual testing suite for the redundancy feature to ensure UI consistency across browsers and devices.

## Overview

This visual testing framework captures screenshots of key UI states and compares them with baseline images to detect unintended visual changes. It's essential for maintaining UI quality during development and CI/CD processes.

## Quick Start

### 1. Generate Baseline Images

First, generate baseline screenshots for all test scenarios:

```bash
# Start development server in another terminal
cd ../../../
npm run dev

# Generate baselines (server must be running)
cd features/redundancy/visual-testing
npm install
npm run generate-baselines
```

### 2. Run Visual Tests

Compare current UI with baselines:

```bash
npm run test-visual
```

### 3. View Results

Open the HTML report to see detailed results:

```bash
open reports/visual-report.html
```

## Commands

### Basic Commands

```bash
# Generate baseline images
npm run generate-baselines

# Run visual regression tests
npm run test-visual

# Clean existing baselines
npm run clean-baselines

# Update baselines (overwrites existing)
npm run update-baselines
```

### Development Commands

```bash
# Run tests with automatic server startup
npm run test-with-server

# Generate baselines with automatic server startup
npm run generate-with-server

# Full test cycle (generate + test)
npm run full-test
```

### CI/CD Commands

```bash
# Run in CI mode (fails build on differences)
npm run ci-test
```

## Configuration

Visual testing configuration is in `config/visual-config.js`:

### Screenshot Settings

```javascript
screenshot: {
  mode: 'fullPage',           // 'fullPage' or 'viewport'
  animations: 'disabled',     // Disable animations for consistency
  caret: 'hide',             // Hide text cursor
  scale: 'device',           // Use device pixel ratio
  timeout: 30000,            // Screenshot timeout
  quality: 90                // JPEG quality (PNG is lossless)
}
```

### Comparison Thresholds

```javascript
expect: {
  threshold: 0.3,            // 30% difference threshold
  maxDiffPixels: 1000,       // Maximum different pixels allowed
  animations: 'disabled'     // Disable animations during comparison
}
```

### Browser Support

- **Chromium** - Primary testing browser
- **Firefox** - Cross-browser compatibility  
- **WebKit** - Safari/iOS compatibility

### Mobile Testing

- **iPhone 12** - Mobile portrait layout
- **iPad** - Tablet landscape layout

## Test Scenarios

### Component Tests
- **redundancy-overlay** - Main overlay display
- **info-panel** - Information panel rendering
- **substation-markers** - Substation marker appearance
- **line-highlights** - Power line highlight styles

### Interaction Tests
- **substation-hover** - Hover state styling
- **substation-selected** - Selection state styling
- **line-hover** - Line hover effects

### System State Tests
- **normal-operation** - Healthy system appearance
- **maintenance-mode** - Maintenance state styling
- **emergency-state** - Emergency alert styling

### Responsive Tests
- **mobile-portrait** - 375x667 mobile layout
- **tablet-landscape** - 1024x768 tablet layout
- **desktop-wide** - 1920x1080 desktop layout

### Animation Tests
- **power-flow-static** - Static power flow visualization
- **substation-pulse-static** - Static pulse animations

## Directory Structure

```
visual-testing/
├── config/
│   └── visual-config.js      # Main configuration
├── baselines/                # Baseline screenshots
├── actual/                   # Current test screenshots
├── diff/                     # Difference images
├── reports/                  # Test reports
│   ├── visual-report.html    # Interactive HTML report
│   ├── visual-results.json   # Machine-readable results
│   └── visual-junit.xml      # JUnit format for CI
├── baseline-generator.js     # Baseline image generator
├── visual-comparison.js      # Test runner and comparator
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Baseline Management

### When to Update Baselines

Update baselines when you intentionally change the UI:

```bash
# Update all baselines
npm run update-baselines

# Or set environment variable
UPDATE_BASELINES=true npm run generate-baselines
```

### Baseline Naming Convention

Baselines follow this pattern:
```
{scenario}-{browser}-{width}x{height}.png
```

Examples:
- `redundancy-overlay-chromium-1280x720.png`
- `substation-hover-firefox-1280x720.png`
- `mobile-portrait-iPhone_12-390x844.png`

### Baseline Validation

Baselines are automatically validated during generation:
- Image format and quality
- Consistent dimensions
- Proper file naming
- Manifest generation

## Test Execution

### Local Development

1. **Start development server**:
   ```bash
   cd ../../../
   npm run dev
   ```

2. **Run visual tests**:
   ```bash
   cd features/redundancy/visual-testing
   npm run test-visual
   ```

3. **Review results**:
   ```bash
   open reports/visual-report.html
   ```

### Automated Testing

Use the combined commands for automated testing:

```bash
# Full automated test
npm run full-test
```

This will:
1. Start the development server
2. Wait for server to be ready
3. Generate fresh baselines
4. Run visual comparison tests
5. Generate reports

### CI/CD Integration

#### GitHub Actions Example

```yaml
- name: Visual Regression Testing
  run: |
    cd features/redundancy/visual-testing
    npm install
    npm run ci-test
  env:
    CI: true
    
- name: Upload Visual Test Results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: visual-test-results
    path: features/redundancy/visual-testing/reports/
```

#### Environment Variables

- `CI=true` - Enables CI mode (fails on differences)
- `UPDATE_BASELINES=true` - Forces baseline update
- `UPDATE_ON_FAILURE=true` - Updates baselines on test failure

## Reports and Analysis

### HTML Report

Interactive report with:
- Test summary statistics
- Side-by-side image comparisons
- Expandable test details
- Diff highlighting

### JSON Report

Machine-readable format for CI integration:

```json
{
  "passed": 15,
  "failed": 2,
  "total": 17,
  "timestamp": "2024-03-01T12:00:00Z",
  "details": [
    {
      "scenario": "redundancy-overlay",
      "browser": "chromium-1280x720",
      "passed": true,
      "diffPixels": 0
    }
  ]
}
```

### JUnit XML

For CI/CD integration and test management systems.

## Troubleshooting

### Common Issues

#### Server Not Running
```
Error: Error: page.goto: net::ERR_CONNECTION_REFUSED
```
**Solution**: Start the development server first
```bash
cd ../../../ && npm run dev
```

#### Missing Baselines
```
Error: Baseline image not found: baselines/test-scenario-chromium-1280x720.png
```
**Solution**: Generate baselines first
```bash
npm run generate-baselines
```

#### Permission Errors
```
Error: EACCES: permission denied, mkdir 'baselines'
```
**Solution**: Check directory permissions
```bash
chmod 755 .
```

#### Memory Issues
```
Error: JavaScript heap out of memory
```
**Solution**: Increase Node.js memory
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run test-visual
```

### Debugging Tips

1. **Check server status**:
   ```bash
   curl http://localhost:3000
   ```

2. **Verify baseline existence**:
   ```bash
   ls -la baselines/
   ```

3. **Test single scenario**:
   Modify `visual-comparison.js` to run specific tests

4. **View actual screenshots**:
   Check `actual/` directory for current screenshots

5. **Compare manually**:
   Use image viewers to compare baseline vs actual

### Performance Optimization

#### Parallel Execution

Configured in `visual-config.js`:
```javascript
performance: {
  maxConcurrency: 4,  // Reduce for lower-spec machines
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000  // 24 hours
  }
}
```

#### Image Optimization

```javascript
optimize: {
  images: true,
  compression: 'png',
  quality: 90
}
```

## Best Practices

### Test Strategy

1. **Baseline Generation**:
   - Generate baselines in stable environment
   - Use consistent viewport sizes
   - Disable animations for predictable results

2. **Test Execution**:
   - Run visual tests on stable builds
   - Include in CI/CD pipeline
   - Test across multiple browsers

3. **Failure Handling**:
   - Review failures manually
   - Update baselines for intentional changes
   - Investigate unexpected differences

### Development Workflow

1. **Feature Development**:
   ```bash
   # Develop feature
   npm run dev
   
   # Generate new baselines
   npm run generate-baselines
   
   # Verify visual quality
   npm run test-visual
   ```

2. **Code Review**:
   ```bash
   # Test visual changes
   npm run test-visual
   
   # Review diff images
   open reports/visual-report.html
   ```

3. **Release Preparation**:
   ```bash
   # Full regression test
   npm run full-test
   
   # Update baselines if needed
   npm run update-baselines
   ```

### Quality Assurance

- **Regular baseline updates** for intentional UI changes
- **Cross-browser testing** for compatibility
- **Responsive testing** across device sizes
- **Performance monitoring** for large datasets
- **Accessibility verification** with visual testing

## Integration

### Percy Integration

For cloud-based visual testing:

```javascript
percy: {
  version: 2,
  snapshot: {
    widths: [375, 768, 1280, 1920],
    minHeight: 600
  }
}
```

### Chromatic Integration

For Storybook visual testing:

```bash
npx chromatic --project-token=your-token
```

### Custom Integrations

The visual testing framework can be extended for:
- Custom browsers
- Additional devices
- Cloud testing services
- Advanced reporting

## Maintenance

### Regular Tasks

1. **Update dependencies**:
   ```bash
   npm update
   ```

2. **Clean old reports**:
   ```bash
   rm -rf reports/*
   rm -rf actual/*
   rm -rf diff/*
   ```

3. **Baseline maintenance**:
   ```bash
   npm run clean-baselines
   npm run generate-baselines
   ```

### Monitoring

- Monitor test execution time
- Track baseline file sizes
- Review failure patterns
- Analyze test coverage

Visual regression testing ensures the redundancy feature maintains consistent visual quality across all supported browsers and devices.