/**
 * Integration Examples for 2N+1 Redundancy Feature
 * Demonstrates various ways to integrate the feature into applications
 */

import React, { useState, useEffect } from 'react';
import {
  RedundancyFeature,
  RedundancyProvider,
  RedundancyButton,
  RedundancyOverlay,
  useRedundancy
} from '../index';

// Example 1: Basic Integration
export function BasicIntegrationExample() {
  return (
    <div className="app">
      <header>
        <h1>Data Center Visualization</h1>
      </header>
      
      <main>
        <div className="map-container">
          {/* Your existing map content */}
          <img src="/datacenter-map.jpg" alt="Data Center Map" />
        </div>
        
        {/* Add redundancy feature */}
        <RedundancyFeature />
      </main>
    </div>
  );
}

// Example 2: Custom Configuration
export function CustomConfigurationExample() {
  const customConfig = {
    colors: {
      active: '#ff0000',
      standby: '#ffaa00',
      connection: '#8b5cf6',
      glow: {
        intensity: 1.2,
        radius: 12
      }
    },
    animations: {
      overlay: {
        fadeIn: 800,
        sequence: {
          lines: 1500,
          substations: 3000,
          panel: 4500
        }
      },
      pulse: {
        duration: 3000,
        easing: 'ease-in-out'
      }
    },
    cssPrefix: 'custom-rdx-',
    zIndex: {
      backdrop: 2000,
      overlay: 2001,
      markers: 2002,
      panel: 2003,
      controls: 2004
    }
  };

  return (
    <RedundancyProvider config={customConfig}>
      <div className="custom-app">
        <RedundancyButton variant="secondary" size="lg" />
        <RedundancyOverlay 
          isVisible={true}
          onClose={() => console.log('Closed')}
        />
      </div>
    </RedundancyProvider>
  );
}

// Example 3: Controlled State Management
export function ControlledStateExample() {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');

  const handleOpen = () => {
    setIsVisible(true);
    setAnimationPhase('starting');
    
    // Progress through animation phases
    setTimeout(() => setAnimationPhase('lines'), 1000);
    setTimeout(() => setAnimationPhase('substations'), 2000);
    setTimeout(() => setAnimationPhase('panel'), 3000);
    setTimeout(() => setAnimationPhase('complete'), 4000);
  };

  const handleClose = () => {
    setAnimationPhase('ending');
    setTimeout(() => {
      setIsVisible(false);
      setAnimationPhase('idle');
    }, 500);
  };

  return (
    <RedundancyProvider>
      <div className="controlled-app">
        <button onClick={handleOpen} disabled={isVisible}>
          Open Redundancy Visualization
        </button>
        
        <RedundancyOverlay
          isVisible={isVisible}
          onClose={handleClose}
        />
        
        {/* Status indicator */}
        <div className="status">
          Phase: {animationPhase}
        </div>
      </div>
    </RedundancyProvider>
  );
}

// Example 4: Plugin-based Integration
export function PluginIntegrationExample() {
  const [pluginStatus, setPluginStatus] = useState('ready'); // Simplified for now
  
  return (
    <div className="plugin-app">
      <h2>Redundancy Feature</h2>
      <p>Status: {pluginStatus}</p>
      
      <RedundancyFeature />
    </div>
  );
}

// Example 5: Component Composition
export function ComponentCompositionExample() {
  return (
    <RedundancyProvider>
      <div className="composition-app">
        {/* Custom trigger */}
        <CustomTriggerButton />
        
        {/* Custom overlay with additional content */}
        <CustomOverlayWithExtras />
      </div>
    </RedundancyProvider>
  );
}

function CustomTriggerButton() {
  const { state, actions } = useRedundancy();
  
  return (
    <div className="custom-trigger">
      <h3>Power Redundancy Analysis</h3>
      <p>View comprehensive 2N+1 redundancy visualization</p>
      
      <button
        onClick={actions.toggleVisibility}
        disabled={state.isActive}
        className="custom-button"
      >
        {state.isActive ? 'Analysis Active' : 'Start Analysis'}
      </button>
      
      {state.isActive && (
        <div className="analysis-status">
          <p>Animation Phase: {state.animationPhase}</p>
          <p>Panel Open: {state.isPanelOpen ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}

function CustomOverlayWithExtras() {
  const { state, actions } = useRedundancy();
  
  if (!state.isActive) return null;
  
  return (
    <>
      <RedundancyOverlay
        isVisible={state.isActive}
        onClose={actions.toggleVisibility}
      />
      
      {/* Additional custom content */}
      <div className="custom-overlay-extras">
        <div className="analysis-controls">
          <button onClick={() => console.log('Export data')}>
            Export Analysis
          </button>
          <button onClick={() => console.log('Print report')}>
            Print Report
          </button>
        </div>
        
        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <span className="legend-color active"></span>
            Active Lines (500kV)
          </div>
          <div className="legend-item">
            <span className="legend-color standby"></span>
            Standby Lines (500kV)
          </div>
        </div>
      </div>
    </>
  );
}

// Example 6: Responsive Integration
export function ResponsiveIntegrationExample() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <RedundancyProvider>
      <div className={`responsive-app ${isMobile ? 'mobile' : 'desktop'}`}>
        {isMobile ? (
          <MobileLayout />
        ) : (
          <DesktopLayout />
        )}
      </div>
    </RedundancyProvider>
  );
}

function MobileLayout() {
  return (
    <div className="mobile-layout">
      <header className="mobile-header">
        <h1>Data Center</h1>
        <RedundancyButton size="sm" />
      </header>
      
      <main className="mobile-main">
        <div className="map-container mobile-map">
          {/* Mobile-optimized map */}
        </div>
      </main>
      
      <RedundancyOverlay
        isVisible={false}
        onClose={() => {}}
      />
    </div>
  );
}

function DesktopLayout() {
  return (
    <div className="desktop-layout">
      <aside className="sidebar">
        <h2>Controls</h2>
        <RedundancyButton />
      </aside>
      
      <main className="desktop-main">
        <div className="map-container desktop-map">
          {/* Desktop-optimized map */}
        </div>
      </main>
      
      <RedundancyOverlay
        isVisible={false}
        onClose={() => {}}
      />
    </div>
  );
}

// Example 7: Error Handling Integration
export function ErrorHandlingExample() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (error) => {
      console.error('Redundancy feature error:', error);
      setHasError(true);
      setErrorMessage(error.message);
    };

    // Listen for plugin errors
    window.addEventListener('redundancy-error', handleError);
    
    return () => {
      window.removeEventListener('redundancy-error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="error-container">
        <h2>Feature Unavailable</h2>
        <p>The redundancy visualization feature encountered an error:</p>
        <code>{errorMessage}</code>
        
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
        
        <button onClick={() => setHasError(false)}>
          Continue Without Feature
        </button>
      </div>
    );
  }

  return (
    <div className="error-handled-app">
      <RedundancyProvider>
        <RedundancyFeature />
      </RedundancyProvider>
    </div>
  );
}

// Example 8: Feature Flag Integration
export function FeatureFlagExample() {
  const [featureEnabled, setFeatureEnabled] = useState(
    process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true'
  );

  const toggleFeature = () => {
    const newState = !featureEnabled;
    setFeatureEnabled(newState);
    
    // In a real app, this would update your feature flag service
    localStorage.setItem('NEXT_PUBLIC_ENABLE_REDUNDANCY', newState.toString());
  };

  return (
    <div className="feature-flag-app">
      <div className="admin-controls">
        <h3>Feature Controls</h3>
        <label>
          <input
            type="checkbox"
            checked={featureEnabled}
            onChange={toggleFeature}
          />
          Enable 2N+1 Redundancy Feature
        </label>
      </div>
      
      {featureEnabled ? (
        <RedundancyFeature />
      ) : (
        <div className="feature-disabled">
          <p>2N+1 Redundancy feature is currently disabled.</p>
        </div>
      )}
    </div>
  );
}

// Example 9: Multi-language Integration
export function MultiLanguageExample() {
  const [language, setLanguage] = useState('en');
  
  const translations = {
    en: {
      title: 'Show 2N+1 Redundancy',
      dataCenterNeeds: 'Data Center Needs',
      activeNow: 'Active Now',
      standbyReady: 'Standby Ready',
      totalCapacity: 'TOTAL CAPACITY'
    },
    vi: {
      title: 'Hiển thị Dự phòng 2N+1',
      dataCenterNeeds: 'Nhu cầu Trung tâm Dữ liệu',
      activeNow: 'Đang hoạt động',
      standbyReady: 'Sẵn sàng dự phòng',
      totalCapacity: 'TỔNG CÔNG SUẤT'
    }
  };

  return (
    <div className="multi-language-app">
      <div className="language-selector">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </div>
      
      <RedundancyProvider>
        <RedundancyFeature />
      </RedundancyProvider>
    </div>
  );
}

// Example 10: Performance Monitoring Integration
export function PerformanceMonitoringExample() {
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  useEffect(() => {
    const monitor = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics = {};
      
      entries.forEach(entry => {
        if (entry.name.includes('redundancy')) {
          metrics[entry.name] = entry.duration;
        }
      });
      
      setPerformanceMetrics(prev => ({ ...prev, ...metrics }));
    });

    monitor.observe({ entryTypes: ['measure'] });
    
    return () => monitor.disconnect();
  }, []);

  return (
    <div className="performance-app">
      <RedundancyProvider>
        <RedundancyFeature />
        
        {/* Performance dashboard */}
        <div className="performance-dashboard">
          <h3>Performance Metrics</h3>
          <ul>
            {Object.entries(performanceMetrics).map(([metric, value]) => (
              <li key={metric}>
                {metric}: {typeof value === 'number' ? value.toFixed(2) : String(value)}ms
              </li>
            ))}
          </ul>
        </div>
      </RedundancyProvider>
    </div>
  );
}

// Export all examples as default to avoid redeclaration
export default {
  BasicIntegrationExample,
  CustomConfigurationExample,
  ControlledStateExample,
  PluginIntegrationExample,
  ComponentCompositionExample,
  ResponsiveIntegrationExample,
  ErrorHandlingExample,
  FeatureFlagExample,
  MultiLanguageExample,
  PerformanceMonitoringExample
};