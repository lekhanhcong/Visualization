/**
 * Visual Regression Testing Configuration
 * Configuration for visual testing and screenshot comparison
 */

const path = require('path')

module.exports = {
  // Playwright visual testing configuration
  playwright: {
    // Screenshot options
    screenshot: {
      mode: 'fullPage',
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
      timeout: 30000,
      quality: 90
    },

    // Visual comparison options
    expect: {
      threshold: 0.3, // 30% difference threshold
      maxDiffPixels: 1000,
      animations: 'disabled'
    },

    // Browser configurations for visual testing
    browsers: {
      chromium: {
        channel: 'chromium',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
      },
      firefox: {
        channel: 'firefox',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      },
      webkit: {
        channel: 'webkit',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      }
    },

    // Mobile viewports
    mobile: {
      'iPhone 12': {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true
      },
      'iPad': {
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: false
      }
    }
  },

  // Percy configuration for cloud-based visual testing
  percy: {
    version: 2,
    discovery: {
      allowedHostnames: ['localhost'],
      networkIdleTimeout: 1000
    },
    snapshot: {
      widths: [375, 768, 1280, 1920],
      minHeight: 600,
      percyCSS: `
        .rdx-animation {
          animation-duration: 0s !important;
          animation-play-state: paused !important;
        }
        .rdx-power-flow-animation {
          animation: none !important;
        }
      `
    }
  },

  // Directories
  directories: {
    baseline: path.resolve(__dirname, '../baselines'),
    actual: path.resolve(__dirname, '../actual'),
    diff: path.resolve(__dirname, '../diff'),
    reports: path.resolve(__dirname, '../reports')
  },

  // Test scenarios for visual testing
  scenarios: {
    // Basic component rendering
    components: {
      'redundancy-overlay': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-overlay',
        description: 'Redundancy overlay display'
      },
      'info-panel': {
        path: '/',
        actions: ['showRedundancyOverlay', 'openInfoPanel'],
        waitFor: '.rdx-info-panel',
        description: 'Info panel display'
      },
      'substation-markers': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-substation-marker',
        description: 'Substation markers display'
      },
      'line-highlights': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-line-highlight',
        description: 'Line highlights display'
      }
    },

    // Interactive states
    interactions: {
      'substation-hover': {
        path: '/',
        actions: ['showRedundancyOverlay', 'hoverSubstation:sub-001'],
        waitFor: '.rdx-substation-marker[aria-selected="true"]',
        description: 'Substation hover state'
      },
      'substation-selected': {
        path: '/',
        actions: ['showRedundancyOverlay', 'clickSubstation:sub-001'],
        waitFor: '.rdx-substation-marker[aria-selected="true"]',
        description: 'Substation selected state'
      },
      'line-hover': {
        path: '/',
        actions: ['showRedundancyOverlay', 'hoverLine:line-001'],
        waitFor: '.rdx-line-highlight:hover',
        description: 'Line hover state'
      }
    },

    // System states
    states: {
      'normal-operation': {
        path: '/',
        actions: ['showRedundancyOverlay', 'setSystemState:normal'],
        waitFor: '.rdx-overlay',
        description: 'Normal operation state'
      },
      'maintenance-mode': {
        path: '/',
        actions: ['showRedundancyOverlay', 'setSystemState:maintenance'],
        waitFor: '.rdx-overlay',
        description: 'Maintenance mode state'
      },
      'emergency-state': {
        path: '/',
        actions: ['showRedundancyOverlay', 'setSystemState:emergency'],
        waitFor: '.rdx-overlay',
        description: 'Emergency state'
      }
    },

    // Responsive layouts
    responsive: {
      'mobile-portrait': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-overlay',
        viewport: { width: 375, height: 667 },
        description: 'Mobile portrait layout'
      },
      'tablet-landscape': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-overlay',
        viewport: { width: 1024, height: 768 },
        description: 'Tablet landscape layout'
      },
      'desktop-wide': {
        path: '/',
        actions: ['showRedundancyOverlay'],
        waitFor: '.rdx-overlay',
        viewport: { width: 1920, height: 1080 },
        description: 'Desktop wide layout'
      }
    },

    // Animations (disabled for consistent testing)
    animations: {
      'power-flow-static': {
        path: '/',
        actions: ['showRedundancyOverlay', 'disableAnimations'],
        waitFor: '.rdx-power-flow-animation',
        description: 'Power flow animation (static)'
      },
      'substation-pulse-static': {
        path: '/',
        actions: ['showRedundancyOverlay', 'disableAnimations', 'triggerPulse:sub-001'],
        waitFor: '.rdx-substation-marker.rdx-pulse',
        description: 'Substation pulse animation (static)'
      }
    }
  },

  // Baseline management
  baseline: {
    // When to update baselines
    updateConditions: {
      forceUpdate: process.env.UPDATE_BASELINES === 'true',
      onFailure: process.env.UPDATE_ON_FAILURE === 'true',
      threshold: 0.05 // Update if >5% different
    },

    // Baseline naming convention
    naming: {
      pattern: '{scenario}-{browser}-{viewport}.png',
      includeDate: false,
      includeHash: true
    }
  },

  // Diff configuration
  diff: {
    // Diff options
    options: {
      threshold: 0.1,
      includeAA: false,
      alpha: 0.4,
      aaColor: [255, 255, 0],
      diffColor: [255, 0, 255],
      diffColorAlt: null
    },

    // Highlight differences
    highlight: {
      boundingBox: true,
      boundingBoxColor: [255, 0, 0],
      overlay: true,
      overlayTransparency: 0.3
    }
  },

  // Reporting
  reporting: {
    // HTML report options
    html: {
      outputPath: path.resolve(__dirname, '../reports/visual-report.html'),
      title: 'Redundancy Feature Visual Regression Report',
      includeBaseline: true,
      includeActual: true,
      includeDiff: true,
      showPassed: true,
      showFailed: true,
      groupBy: 'scenario'
    },

    // JSON report for CI/CD
    json: {
      outputPath: path.resolve(__dirname, '../reports/visual-results.json'),
      includeMetadata: true,
      includeTimestamps: true
    },

    // JUnit XML for CI integration
    junit: {
      outputPath: path.resolve(__dirname, '../reports/visual-junit.xml'),
      suiteName: 'Visual Regression Tests'
    }
  },

  // CI/CD integration
  ci: {
    // Fail build on visual differences
    failOnDifference: process.env.CI === 'true',
    
    // Upload artifacts
    uploadArtifacts: {
      enabled: process.env.CI === 'true',
      include: ['reports/', 'diff/', 'actual/'],
      provider: process.env.ARTIFACT_PROVIDER || 'github'
    },

    // Notifications
    notifications: {
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK,
        webhook: process.env.SLACK_WEBHOOK,
        channel: '#redundancy-testing'
      },
      email: {
        enabled: !!process.env.EMAIL_NOTIFICATIONS,
        recipients: ['team@company.com']
      }
    }
  },

  // Performance optimization
  performance: {
    // Parallel execution
    maxConcurrency: process.env.CI ? 2 : 4,
    
    // Caching
    cache: {
      enabled: true,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      directory: path.resolve(__dirname, '../.cache')
    },

    // Resource optimization
    optimize: {
      images: true,
      compression: 'png',
      quality: 90
    }
  }
}