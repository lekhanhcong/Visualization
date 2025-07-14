/**
 * Animation Configuration Loader
 * Handles loading, validation, and management of animation configurations
 */

export interface AnimationTiming {
  totalDuration: number;
  startDelay: number;
  textTriggerPoint: number;
  stabilizationDelay: number;
  frameRate: number;
}

export interface EasingConfig {
  imageTransition: string;
  textFadeIn: string;
  textScale: string;
  crossfade: string;
}

export interface PerformanceConfig {
  useGPUAcceleration: boolean;
  enableFrameRateOptimization: boolean;
  maxConcurrentAnimations: number;
  memoryUsageLimit: number;
  targetFPS: number;
  enablePreloading: boolean;
  useWebWorkers: boolean;
}

export interface AccessibilityConfig {
  respectReducedMotion: boolean;
  highContrastMode: boolean;
  skipAnimationKeyboard: string;
  provideFallback: boolean;
  enableScreenReaderSupport: boolean;
}

export interface DebuggingConfig {
  showProgressIndicator: boolean;
  enablePerformanceLogging: boolean;
  captureFrameMetrics: boolean;
  showDebugOverlay: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  optimizations: {
    mobile: Partial<AnimationConfig>;
    tablet: Partial<AnimationConfig>;
    desktop: Partial<AnimationConfig>;
  };
}

export interface AnimationConfig {
  timing: AnimationTiming;
  easing: EasingConfig;
  performance: PerformanceConfig;
  accessibility: AccessibilityConfig;
  debugging: DebuggingConfig;
  responsive: ResponsiveConfig;
  version: string;
  lastUpdated: string;
}

export interface ConfigSource {
  url?: string;
  data?: Partial<AnimationConfig>;
  priority: number;
  name: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config?: AnimationConfig;
}

/**
 * Animation Configuration Loader and Manager
 */
export class AnimationConfigLoader {
  private static instance: AnimationConfigLoader;
  private currentConfig: AnimationConfig;
  private configSources: ConfigSource[] = [];
  private cache = new Map<string, AnimationConfig>();
  private validators = new Map<string, (value: any) => boolean>();
  private listeners = new Set<(config: AnimationConfig) => void>();

  private constructor() {
    this.currentConfig = this.getDefaultConfig();
    this.setupValidators();
    this.setupResponsiveHandling();
  }

  static getInstance(): AnimationConfigLoader {
    if (!AnimationConfigLoader.instance) {
      AnimationConfigLoader.instance = new AnimationConfigLoader();
    }
    return AnimationConfigLoader.instance;
  }

  /**
   * Load configuration from multiple sources
   */
  async loadConfig(sources: ConfigSource[] = []): Promise<AnimationConfig> {
    this.configSources = [...sources].sort((a, b) => b.priority - a.priority);

    let mergedConfig = this.getDefaultConfig();

    // Load and merge configurations by priority
    for (const source of this.configSources) {
      try {
        let sourceConfig: Partial<AnimationConfig>;

        if (source.url) {
          sourceConfig = await this.loadFromUrl(source.url);
        } else if (source.data) {
          sourceConfig = source.data;
        } else {
          continue;
        }

        mergedConfig = this.mergeConfigs(mergedConfig, sourceConfig);
      } catch (error) {
        console.warn(`Failed to load config from ${source.name}:`, error);
      }
    }

    // Apply responsive optimizations
    const responsiveConfig = this.applyResponsiveOptimizations(mergedConfig);

    // Validate final configuration
    const validation = this.validateConfig(responsiveConfig);
    if (!validation.isValid) {
      console.error('Invalid animation configuration:', validation.errors);
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    this.currentConfig = responsiveConfig;
    this.notifyListeners();

    return this.currentConfig;
  }

  /**
   * Get current configuration
   */
  getConfig(): AnimationConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<AnimationConfig>): AnimationConfig {
    const newConfig = this.mergeConfigs(this.currentConfig, updates);
    const validation = this.validateConfig(newConfig);

    if (!validation.isValid) {
      throw new Error(`Configuration update failed: ${validation.errors.join(', ')}`);
    }

    this.currentConfig = newConfig;
    this.notifyListeners();

    return this.currentConfig;
  }

  /**
   * Subscribe to configuration changes
   */
  onConfigChange(listener: (config: AnimationConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get responsive configuration for current viewport
   */
  getResponsiveConfig(): AnimationConfig {
    return this.applyResponsiveOptimizations(this.currentConfig);
  }

  /**
   * Validate configuration object
   */
  validateConfig(config: Partial<AnimationConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Timing validation
    if (config.timing) {
      if (config.timing.totalDuration <= 0) {
        errors.push('Total duration must be positive');
      }
      if (config.timing.startDelay < 0) {
        errors.push('Start delay cannot be negative');
      }
      if (config.timing.textTriggerPoint < 0 || config.timing.textTriggerPoint > 1) {
        errors.push('Text trigger point must be between 0 and 1');
      }
      if (config.timing.frameRate > 120) {
        warnings.push('Frame rate over 120 may cause performance issues');
      }
    }

    // Performance validation
    if (config.performance) {
      if (config.performance.memoryUsageLimit <= 0) {
        errors.push('Memory usage limit must be positive');
      }
      if (config.performance.maxConcurrentAnimations <= 0) {
        errors.push('Max concurrent animations must be positive');
      }
      if (config.performance.targetFPS > 120) {
        warnings.push('Target FPS over 120 may not be achievable');
      }
    }

    // Custom validator checks
    for (const [path, validator] of this.validators) {
      const value = this.getNestedValue(config, path);
      if (value !== undefined && !validator(value)) {
        errors.push(`Invalid value for ${path}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config: errors.length === 0 ? config as AnimationConfig : undefined
    };
  }

  /**
   * Reset to default configuration
   */
  resetToDefault(): AnimationConfig {
    this.currentConfig = this.getDefaultConfig();
    this.notifyListeners();
    return this.currentConfig;
  }

  /**
   * Export current configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonString: string): AnimationConfig {
    try {
      const config = JSON.parse(jsonString);
      return this.updateConfig(config);
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }

  private async loadFromUrl(url: string): Promise<Partial<AnimationConfig>> {
    const cacheKey = `url:${url}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const config = await response.json();
    this.cache.set(cacheKey, config);

    return config;
  }

  private mergeConfigs(base: AnimationConfig, override: Partial<AnimationConfig>): AnimationConfig {
    return {
      timing: { ...base.timing, ...override.timing },
      easing: { ...base.easing, ...override.easing },
      performance: { ...base.performance, ...override.performance },
      accessibility: { ...base.accessibility, ...override.accessibility },
      debugging: { ...base.debugging, ...override.debugging },
      responsive: {
        breakpoints: { ...base.responsive.breakpoints, ...override.responsive?.breakpoints },
        optimizations: {
          mobile: { ...base.responsive.optimizations.mobile, ...override.responsive?.optimizations?.mobile },
          tablet: { ...base.responsive.optimizations.tablet, ...override.responsive?.optimizations?.tablet },
          desktop: { ...base.responsive.optimizations.desktop, ...override.responsive?.optimizations?.desktop }
        }
      },
      version: override.version || base.version,
      lastUpdated: new Date().toISOString()
    };
  }

  private applyResponsiveOptimizations(config: AnimationConfig): AnimationConfig {
    const viewportWidth = window.innerWidth;
    const { breakpoints, optimizations } = config.responsive;

    let responsiveOverrides: Partial<AnimationConfig> = {};

    if (viewportWidth <= breakpoints.mobile) {
      responsiveOverrides = optimizations.mobile;
    } else if (viewportWidth <= breakpoints.tablet) {
      responsiveOverrides = optimizations.tablet;
    } else {
      responsiveOverrides = optimizations.desktop;
    }

    return this.mergeConfigs(config, responsiveOverrides);
  }

  private getDefaultConfig(): AnimationConfig {
    return {
      timing: {
        totalDuration: 3000,
        startDelay: 500,
        textTriggerPoint: 0.5,
        stabilizationDelay: 500,
        frameRate: 60
      },
      easing: {
        imageTransition: 'cubic-bezier(0.65, 0, 0.35, 1)',
        textFadeIn: 'cubic-bezier(0.25, 1, 0.5, 1)',
        textScale: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        crossfade: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      performance: {
        useGPUAcceleration: true,
        enableFrameRateOptimization: true,
        maxConcurrentAnimations: 1,
        memoryUsageLimit: 50,
        targetFPS: 60,
        enablePreloading: true,
        useWebWorkers: false
      },
      accessibility: {
        respectReducedMotion: true,
        highContrastMode: false,
        skipAnimationKeyboard: 'Escape',
        provideFallback: true,
        enableScreenReaderSupport: true
      },
      debugging: {
        showProgressIndicator: process.env.NODE_ENV === 'development',
        enablePerformanceLogging: process.env.NODE_ENV === 'development',
        captureFrameMetrics: process.env.NODE_ENV === 'development',
        showDebugOverlay: false,
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
      },
      responsive: {
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1920
        },
        optimizations: {
          mobile: {
            timing: { totalDuration: 2000, frameRate: 30 },
            performance: { targetFPS: 30, memoryUsageLimit: 30 }
          },
          tablet: {
            timing: { frameRate: 45 },
            performance: { targetFPS: 45, memoryUsageLimit: 40 }
          },
          desktop: {
            timing: { frameRate: 60 },
            performance: { targetFPS: 60, memoryUsageLimit: 50 }
          }
        }
      },
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  private setupValidators(): void {
    this.validators.set('timing.totalDuration', (value) => typeof value === 'number' && value > 0);
    this.validators.set('timing.startDelay', (value) => typeof value === 'number' && value >= 0);
    this.validators.set('timing.textTriggerPoint', (value) => typeof value === 'number' && value >= 0 && value <= 1);
    this.validators.set('performance.memoryUsageLimit', (value) => typeof value === 'number' && value > 0);
    this.validators.set('performance.targetFPS', (value) => typeof value === 'number' && value > 0 && value <= 120);
  }

  private setupResponsiveHandling(): void {
    let resizeTimer: number;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const newConfig = this.applyResponsiveOptimizations(this.currentConfig);
        if (JSON.stringify(newConfig) !== JSON.stringify(this.currentConfig)) {
          this.currentConfig = newConfig;
          this.notifyListeners();
        }
      }, 300);
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentConfig);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Export singleton instance
export const animationConfigLoader = AnimationConfigLoader.getInstance();

// Utility functions for common config operations
export function createConfigSource(name: string, data: Partial<AnimationConfig>, priority = 0): ConfigSource {
  return { name, data, priority };
}

export function createUrlConfigSource(name: string, url: string, priority = 0): ConfigSource {
  return { name, url, priority };
}

export function getOptimalConfigForDevice(): Partial<AnimationConfig> {
  const isMobile = window.innerWidth <= 768;
  const isLowEnd = navigator.hardwareConcurrency <= 2;
  const hasLowMemory = (navigator as any).deviceMemory <= 2;

  if (isMobile || isLowEnd || hasLowMemory) {
    return {
      timing: { totalDuration: 2000, frameRate: 30 },
      performance: {
        targetFPS: 30,
        memoryUsageLimit: 20,
        useGPUAcceleration: false,
        enableFrameRateOptimization: true
      }
    };
  }

  return {
    timing: { totalDuration: 3000, frameRate: 60 },
    performance: {
      targetFPS: 60,
      memoryUsageLimit: 50,
      useGPUAcceleration: true,
      enableFrameRateOptimization: true
    }
  };
}