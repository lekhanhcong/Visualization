/**
 * Animation Event System
 * Manages animation events, state tracking, and performance monitoring
 */

export enum AnimationEvent {
  INIT = 'animation:init',
  START = 'animation:start',
  PROGRESS = 'animation:progress',
  PAUSE = 'animation:pause',
  RESUME = 'animation:resume',
  COMPLETE = 'animation:complete',
  ERROR = 'animation:error',
  CANCEL = 'animation:cancel',
  FRAME_UPDATE = 'animation:frame-update',
  PERFORMANCE_WARNING = 'animation:performance-warning',
  MEMORY_WARNING = 'animation:memory-warning'
}

export interface AnimationEventData {
  animationId: string;
  timestamp: number;
  progress: number;
  duration: number;
  target: string;
  phase: AnimationPhase;
  metadata?: Record<string, any>;
  error?: Error;
  performanceMetrics?: PerformanceMetrics;
}

export enum AnimationPhase {
  INITIALIZATION = 'initialization',
  IMAGE_PRELOAD = 'image-preload',
  CROSSFADE = 'crossfade',
  TEXT_OVERLAY = 'text-overlay',
  COMPLETION = 'completion',
  ERROR_RECOVERY = 'error-recovery'
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  cpuUsage: number;
  droppedFrames: number;
  renderTime: number;
  totalFrames: number;
}

export interface AnimationState {
  id: string;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';
  progress: number;
  startTime: number;
  duration: number;
  currentPhase: AnimationPhase;
  retryCount: number;
  errorCount: number;
  performanceScore: number;
}

/**
 * Central event bus for animation system
 */
export class AnimationEventBus extends EventTarget {
  private static instance: AnimationEventBus;
  private listeners = new Map<AnimationEvent, Set<Function>>();
  private animationStates = new Map<string, AnimationState>();
  private performanceMonitor: PerformanceMonitor;
  private debugMode = false;

  private constructor() {
    super();
    this.performanceMonitor = new PerformanceMonitor();
    this.setupGlobalErrorHandling();
  }

  static getInstance(): AnimationEventBus {
    if (!AnimationEventBus.instance) {
      AnimationEventBus.instance = new AnimationEventBus();
    }
    return AnimationEventBus.instance;
  }

  /**
   * Emit animation event
   */
  emit(event: AnimationEvent, data: AnimationEventData): void {
    this.updateAnimationState(data);
    
    const customEvent = new CustomEvent(event, { 
      detail: data,
      bubbles: true,
      cancelable: true
    });

    this.dispatchEvent(customEvent);

    if (this.debugMode) {
      console.log(`[AnimationEvent] ${event}:`, data);
    }

    // Check for performance issues
    if (data.performanceMetrics) {
      this.checkPerformanceThresholds(data.performanceMetrics, data.animationId);
    }
  }

  /**
   * Subscribe to animation events
   */
  on(event: AnimationEvent, handler: (data: AnimationEventData) => void): () => void {
    const wrappedHandler = (e: CustomEvent) => handler(e.detail);
    this.addEventListener(event, wrappedHandler);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(wrappedHandler);

    // Return unsubscribe function
    return () => {
      this.removeEventListener(event, wrappedHandler);
      this.listeners.get(event)?.delete(wrappedHandler);
    };
  }

  /**
   * Subscribe to multiple events
   */
  onMultiple(
    events: AnimationEvent[], 
    handler: (event: AnimationEvent, data: AnimationEventData) => void
  ): () => void {
    const unsubscribers = events.map(event => 
      this.on(event, (data) => handler(event, data))
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }

  /**
   * One-time event subscription
   */
  once(event: AnimationEvent, handler: (data: AnimationEventData) => void): void {
    const wrappedHandler = (e: CustomEvent) => {
      handler(e.detail);
      this.removeEventListener(event, wrappedHandler);
    };
    this.addEventListener(event, wrappedHandler);
  }

  /**
   * Remove all listeners for an event
   */
  off(event: AnimationEvent): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        this.removeEventListener(event, handler as EventListener);
      });
      this.listeners.delete(event);
    }
  }

  /**
   * Get current animation state
   */
  getAnimationState(animationId: string): AnimationState | undefined {
    return this.animationStates.get(animationId);
  }

  /**
   * Get all animation states
   */
  getAllAnimationStates(): Map<string, AnimationState> {
    return new Map(this.animationStates);
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get performance metrics for animation
   */
  getPerformanceMetrics(animationId: string): PerformanceMetrics | undefined {
    return this.performanceMonitor.getMetrics(animationId);
  }

  /**
   * Start performance monitoring for animation
   */
  startPerformanceMonitoring(animationId: string): void {
    this.performanceMonitor.start(animationId);
  }

  /**
   * Stop performance monitoring for animation
   */
  stopPerformanceMonitoring(animationId: string): void {
    this.performanceMonitor.stop(animationId);
  }

  private updateAnimationState(data: AnimationEventData): void {
    const { animationId } = data;
    let state = this.animationStates.get(animationId);

    if (!state) {
      state = {
        id: animationId,
        status: 'idle',
        progress: 0,
        startTime: Date.now(),
        duration: data.duration,
        currentPhase: data.phase,
        retryCount: 0,
        errorCount: 0,
        performanceScore: 100
      };
      this.animationStates.set(animationId, state);
    }

    // Update state based on event type
    switch (data.metadata?.eventType) {
      case AnimationEvent.START:
        state.status = 'playing';
        state.startTime = data.timestamp;
        break;
      case AnimationEvent.PAUSE:
        state.status = 'paused';
        break;
      case AnimationEvent.RESUME:
        state.status = 'playing';
        break;
      case AnimationEvent.COMPLETE:
        state.status = 'completed';
        state.progress = 1;
        break;
      case AnimationEvent.ERROR:
        state.status = 'error';
        state.errorCount++;
        break;
      case AnimationEvent.PROGRESS:
        state.progress = data.progress;
        state.currentPhase = data.phase;
        break;
    }

    // Update performance score
    if (data.performanceMetrics) {
      state.performanceScore = this.calculatePerformanceScore(data.performanceMetrics);
    }
  }

  private checkPerformanceThresholds(metrics: PerformanceMetrics, animationId: string): void {
    const warnings: string[] = [];

    if (metrics.fps < 30) {
      warnings.push(`Low FPS: ${metrics.fps}`);
    }

    if (metrics.memoryUsage > 50) {
      warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
    }

    if (metrics.droppedFrames > 10) {
      warnings.push(`Dropped frames: ${metrics.droppedFrames}`);
    }

    if (warnings.length > 0) {
      this.emit(AnimationEvent.PERFORMANCE_WARNING, {
        animationId,
        timestamp: Date.now(),
        progress: 0,
        duration: 0,
        target: 'performance-monitor',
        phase: AnimationPhase.CROSSFADE,
        metadata: { warnings },
        performanceMetrics: metrics
      });
    }
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Deduct points for poor performance
    if (metrics.fps < 60) score -= (60 - metrics.fps);
    if (metrics.memoryUsage > 30) score -= (metrics.memoryUsage - 30) * 2;
    if (metrics.droppedFrames > 0) score -= metrics.droppedFrames * 5;

    return Math.max(0, Math.min(100, score));
  }

  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('animation') || event.message?.includes('animation')) {
        this.emit(AnimationEvent.ERROR, {
          animationId: 'global',
          timestamp: Date.now(),
          progress: 0,
          duration: 0,
          target: 'global-error-handler',
          phase: AnimationPhase.ERROR_RECOVERY,
          error: new Error(event.message),
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('animation')) {
        this.emit(AnimationEvent.ERROR, {
          animationId: 'global',
          timestamp: Date.now(),
          progress: 0,
          duration: 0,
          target: 'global-rejection-handler',
          phase: AnimationPhase.ERROR_RECOVERY,
          error: event.reason,
          metadata: { type: 'unhandled-rejection' }
        });
      }
    });
  }
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private startTimes = new Map<string, number>();
  private frameCounters = new Map<string, number>();
  private animationFrameIds = new Map<string, number>();

  start(animationId: string): void {
    this.startTimes.set(animationId, performance.now());
    this.frameCounters.set(animationId, 0);

    const metrics: PerformanceMetrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      droppedFrames: 0,
      renderTime: 0,
      totalFrames: 0
    };

    this.metrics.set(animationId, metrics);
    this.startFrameTracking(animationId);
  }

  stop(animationId: string): void {
    const frameId = this.animationFrameIds.get(animationId);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.animationFrameIds.delete(animationId);
    }

    this.startTimes.delete(animationId);
    this.frameCounters.delete(animationId);
  }

  getMetrics(animationId: string): PerformanceMetrics | undefined {
    return this.metrics.get(animationId);
  }

  private startFrameTracking(animationId: string): void {
    let lastFrameTime = performance.now();
    let frameCount = 0;

    const trackFrame = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime;
      frameCount++;

      const metrics = this.metrics.get(animationId);
      if (metrics) {
        metrics.fps = 1000 / deltaTime;
        metrics.frameTime = deltaTime;
        metrics.totalFrames = frameCount;
        metrics.memoryUsage = this.getMemoryUsage();
        metrics.renderTime = performance.now() - currentTime;

        if (deltaTime > 16.67) { // Dropped frame (60fps = 16.67ms per frame)
          metrics.droppedFrames++;
        }
      }

      lastFrameTime = currentTime;
      
      if (this.animationFrameIds.has(animationId)) {
        const frameId = requestAnimationFrame(trackFrame);
        this.animationFrameIds.set(animationId, frameId);
      }
    };

    const frameId = requestAnimationFrame(trackFrame);
    this.animationFrameIds.set(animationId, frameId);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }
}

/**
 * Animation event decorators for easy event emission
 */
export function emitAnimationEvent(event: AnimationEvent) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const eventBus = AnimationEventBus.getInstance();
      
      try {
        const result = originalMethod.apply(this, args);
        
        eventBus.emit(event, {
          animationId: this.animationId || 'unknown',
          timestamp: Date.now(),
          progress: this.progress || 0,
          duration: this.duration || 0,
          target: target.constructor.name,
          phase: this.currentPhase || AnimationPhase.INITIALIZATION,
          metadata: { method: propertyKey, args }
        });

        return result;
      } catch (error) {
        eventBus.emit(AnimationEvent.ERROR, {
          animationId: this.animationId || 'unknown',
          timestamp: Date.now(),
          progress: this.progress || 0,
          duration: this.duration || 0,
          target: target.constructor.name,
          phase: AnimationPhase.ERROR_RECOVERY,
          error: error as Error,
          metadata: { method: propertyKey, args }
        });

        throw error;
      }
    };

    return descriptor;
  };
}

// Export singleton instance
export const animationEventBus = AnimationEventBus.getInstance();