/**
 * SimpleRedundancyFeature - Enhanced version with event system and configuration
 * Version 4: Advanced animation system with full event handling and configuration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  animationEventBus, 
  AnimationEvent, 
  AnimationPhase,
  emitAnimationEvent 
} from '../utils/AnimationEventSystem';
import { 
  animationConfigLoader, 
  AnimationConfig,
  getOptimalConfigForDevice 
} from '../utils/AnimationConfigLoader';
import '../styles/animation-classes.css';

interface SimpleRedundancyFeatureProps {
  className?: string;
  animationId?: string;
  enableDebug?: boolean;
  onAnimationComplete?: () => void;
  onAnimationError?: (error: Error) => void;
}

interface ImageConfig {
  images: {
    default: string;
    '2n1': string;
  };
  textOverlays: {
    '2n1': {
      text: string;
      position: { x: string; y: string };
      style: {
        fontSize: string;
        fontWeight: string;
        color: string;
        textAlign: string;
        textShadow: string;
      };
    };
  };
}

interface AnimationState {
  progress: number;
  phase: AnimationPhase;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  retryCount: number;
}

export const SimpleRedundancyFeature: React.FC<SimpleRedundancyFeatureProps> = ({ 
  className = '',
  animationId = 'power-redundancy-animation',
  enableDebug = false,
  onAnimationComplete,
  onAnimationError
}) => {
  const [imageConfig, setImageConfig] = useState<ImageConfig | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    progress: 0,
    phase: AnimationPhase.INITIALIZATION,
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    hasError: false,
    retryCount: 0
  });
  const [config, setConfig] = useState<AnimationConfig | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize configuration and event system
  useEffect(() => {
    const initializeAnimation = async () => {
      try {
        // Load optimal configuration for current device
        const deviceConfig = getOptimalConfigForDevice();
        await animationConfigLoader.loadConfig([
          { name: 'device-optimal', data: deviceConfig, priority: 10 },
          { name: 'user-preferences', url: '/config/animation-preferences.json', priority: 5 }
        ]);

        const loadedConfig = animationConfigLoader.getConfig();
        setConfig(loadedConfig);

        // Start performance monitoring
        animationEventBus.startPerformanceMonitoring(animationId);

        // Emit initialization event
        animationEventBus.emit(AnimationEvent.INIT, {
          animationId,
          timestamp: Date.now(),
          progress: 0,
          duration: loadedConfig.timing.totalDuration,
          target: 'SimpleRedundancyFeature',
          phase: AnimationPhase.INITIALIZATION,
          metadata: { deviceConfig }
        });

      } catch (error) {
        handleAnimationError(error as Error);
      }
    };

    initializeAnimation();

    // Subscribe to configuration changes
    const unsubscribeConfig = animationConfigLoader.onConfigChange((newConfig) => {
      setConfig(newConfig);
    });

    // Subscribe to animation events
    const unsubscribeEvents = animationEventBus.onMultiple(
      [AnimationEvent.ERROR, AnimationEvent.PERFORMANCE_WARNING],
      handleAnimationEvent
    );

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationEventBus.stopPerformanceMonitoring(animationId);
      unsubscribeConfig();
      unsubscribeEvents();
    };
  }, [animationId]);

  // Load image configuration
  useEffect(() => {
    const loadImageConfig = async () => {
      try {
        setAnimationState(prev => ({ ...prev, phase: AnimationPhase.IMAGE_PRELOAD }));

        const response = await fetch('/data/image-config.json');
        const imageConfigData = await response.json();
        setImageConfig(imageConfigData);

        // Preload images
        await preloadImages([imageConfigData.images.default, imageConfigData.images['2n1']]);

        animationEventBus.emit(AnimationEvent.PROGRESS, {
          animationId,
          timestamp: Date.now(),
          progress: 0.1,
          duration: config?.timing.totalDuration || 3000,
          target: 'image-loader',
          phase: AnimationPhase.IMAGE_PRELOAD,
          metadata: { imagesLoaded: 2 }
        });

      } catch (error) {
        handleAnimationError(error as Error);
      }
    };

    if (config) {
      loadImageConfig();
    }
  }, [config, animationId]);

  // Start animation when images are loaded
  useEffect(() => {
    if (imageConfig && config && !animationState.isPlaying) {
      const timer = setTimeout(() => {
        startAnimation();
      }, config.timing.startDelay);

      return () => clearTimeout(timer);
    }
  }, [imageConfig, config, animationState.isPlaying]);

  const preloadImages = async (imageUrls: string[]): Promise<void> => {
    const promises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    await Promise.all(promises);
  };

  const startAnimation = useCallback(() => {
    if (!config || animationState.isPlaying) return;

    setAnimationState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      phase: AnimationPhase.CROSSFADE 
    }));

    startTimeRef.current = Date.now();

    animationEventBus.emit(AnimationEvent.START, {
      animationId,
      timestamp: Date.now(),
      progress: 0,
      duration: config.timing.totalDuration,
      target: 'animation-controller',
      phase: AnimationPhase.CROSSFADE
    });

    animateTransition();
  }, [config, animationState.isPlaying, animationId]);

  const animateTransition = useCallback(() => {
    if (!startTimeRef.current || !config) return;

    const currentTime = Date.now();
    const elapsed = currentTime - startTimeRef.current;
    const progress = Math.min(elapsed / config.timing.totalDuration, 1);

    // Apply easing function
    const easedProgress = easeInOutCubic(progress);

    setAnimationState(prev => {
      const newPhase = progress > config.timing.textTriggerPoint 
        ? AnimationPhase.TEXT_OVERLAY 
        : AnimationPhase.CROSSFADE;

      return {
        ...prev,
        progress: easedProgress,
        phase: newPhase
      };
    });

    // Emit progress event
    animationEventBus.emit(AnimationEvent.PROGRESS, {
      animationId,
      timestamp: currentTime,
      progress: easedProgress,
      duration: config.timing.totalDuration,
      target: 'animation-frame',
      phase: progress > config.timing.textTriggerPoint 
        ? AnimationPhase.TEXT_OVERLAY 
        : AnimationPhase.CROSSFADE,
      performanceMetrics: animationEventBus.getPerformanceMetrics(animationId)
    });

    if (progress < 1 && !animationState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(animateTransition);
    } else {
      completeAnimation();
    }
  }, [config, animationState.isPaused, animationId]);

  const completeAnimation = useCallback(() => {
    setAnimationState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isCompleted: true,
      phase: AnimationPhase.COMPLETION,
      progress: 1
    }));

    animationEventBus.emit(AnimationEvent.COMPLETE, {
      animationId,
      timestamp: Date.now(),
      progress: 1,
      duration: config?.timing.totalDuration || 3000,
      target: 'animation-controller',
      phase: AnimationPhase.COMPLETION,
      performanceMetrics: animationEventBus.getPerformanceMetrics(animationId)
    });

    onAnimationComplete?.();

    // Stop performance monitoring
    setTimeout(() => {
      animationEventBus.stopPerformanceMonitoring(animationId);
    }, 1000);
  }, [animationId, config, onAnimationComplete]);

  const handleAnimationError = useCallback((error: Error) => {
    setAnimationState(prev => ({ 
      ...prev, 
      hasError: true,
      isPlaying: false,
      retryCount: prev.retryCount + 1
    }));

    animationEventBus.emit(AnimationEvent.ERROR, {
      animationId,
      timestamp: Date.now(),
      progress: animationState.progress,
      duration: config?.timing.totalDuration || 3000,
      target: 'error-handler',
      phase: AnimationPhase.ERROR_RECOVERY,
      error
    });

    onAnimationError?.(error);

    // Auto-retry logic
    if (animationState.retryCount < 3) {
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, hasError: false }));
        startAnimation();
      }, 1000 * (animationState.retryCount + 1));
    }
  }, [animationId, animationState.progress, animationState.retryCount, config, onAnimationError, startAnimation]);

  const handleAnimationEvent = useCallback((event: AnimationEvent, data: any) => {
    if (data.animationId !== animationId) return;

    switch (event) {
      case AnimationEvent.PERFORMANCE_WARNING:
        console.warn('Animation performance warning:', data.metadata.warnings);
        break;
      case AnimationEvent.ERROR:
        console.error('Animation error:', data.error);
        break;
    }
  }, [animationId]);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Render loading state
  if (!imageConfig || !config) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500 animation-loading">
          Loading animation configuration...
        </div>
      </div>
    );
  }

  // Render error state
  if (animationState.hasError && animationState.retryCount >= 3) {
    return (
      <div className="flex items-center justify-center p-4 animation-error">
        <div className="text-red-500">
          Animation failed to load. Please refresh the page.
        </div>
      </div>
    );
  }

  const textOverlay = imageConfig.textOverlays['2n1'];
  const showTextOverlay = animationState.progress > config.timing.textTriggerPoint;
  const textOpacity = showTextOverlay ? (animationState.progress - config.timing.textTriggerPoint) * 2 : 0;

  const containerClasses = [
    'relative w-full h-full overflow-hidden',
    'animation-container gpu-accelerated render-optimized',
    enableDebug && 'debug-animation',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      data-animation-id={animationId}
      data-animation-progress={animationState.progress}
      data-animation-phase={animationState.phase}
    >
      {/* Image Container with both images */}
      <div className="relative w-full h-full composition-optimized">
        {/* Power.png - Default image (fades out) */}
        <Image
          src={imageConfig.images.default}
          alt="Main Power Infrastructure"
          fill
          className={`object-contain absolute inset-0 gpu-accelerated ${
            animationState.progress > 0.5 ? 'power-image-exit' : 'power-image-enter'
          }`}
          style={{
            opacity: 1 - animationState.progress,
            transition: 'none',
            willChange: config.performance.useGPUAcceleration ? 'transform, opacity' : 'auto'
          }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Power_2N1.png - 2N+1 image (fades in) */}
        <Image
          src={imageConfig.images['2n1']}
          alt="2N+1 Redundancy View"
          fill
          className={`object-contain absolute inset-0 gpu-accelerated ${
            animationState.progress > 0.5 ? 'power-2n1-active' : 'power-2n1-enter'
          }`}
          style={{
            opacity: animationState.progress,
            transition: 'none',
            willChange: config.performance.useGPUAcceleration ? 'transform, opacity' : 'auto'
          }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Text Overlay for 2N+1 View */}
        {showTextOverlay && (
          <div
            className="absolute flex items-center justify-center pointer-events-none gpu-optimized-text"
            style={{
              left: textOverlay.position.x,
              top: textOverlay.position.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              opacity: Math.min(textOpacity, 1)
            }}
          >
            <div
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-white via-blue-50 to-cyan-50 backdrop-blur-lg border-2 border-cyan-300 shadow-2xl timing-elastic-out"
              style={{
                fontSize: 'clamp(16px, 2.2vw, 24px)',
                fontWeight: 'bold',
                color: '#0066CC',
                textAlign: 'center',
                textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                animation: 'pulseGlow 3s ease-in-out infinite',
                boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                transform: `scale(${0.8 + Math.min(textOpacity, 1) * 0.2})`
              }}
            >
              {textOverlay.text}
            </div>
          </div>
        )}
      </div>

      {/* Debug Information */}
      {(enableDebug || config.debugging.showProgressIndicator) && (
        <div className="absolute bottom-2 left-2 z-20 bg-black/70 text-white text-xs px-3 py-2 rounded font-mono">
          <div>Progress: {Math.round(animationState.progress * 100)}%</div>
          <div>Phase: {animationState.phase}</div>
          <div>FPS: {performanceMetrics?.fps?.toFixed(1) || 'N/A'}</div>
          {animationState.retryCount > 0 && (
            <div className="text-yellow-400">Retries: {animationState.retryCount}</div>
          )}
        </div>
      )}

      {/* Performance Warning */}
      {performanceMetrics && performanceMetrics.fps < 30 && (
        <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs px-2 py-1 rounded">
          Low FPS: {performanceMetrics.fps.toFixed(1)}
        </div>
      )}

      {/* Accessibility Skip Button */}
      <button
        className="sr-only focus:not-sr-only absolute top-2 left-2 z-30 bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() => completeAnimation()}
        onKeyDown={(e) => {
          if (e.key === config.accessibility.skipAnimationKeyboard) {
            completeAnimation();
          }
        }}
      >
        Skip Animation ({config.accessibility.skipAnimationKeyboard})
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5);
            border-color: #00BFFF;
          }
          50% {
            box-shadow: 0 8px 40px rgba(0, 102, 204, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 0 20px rgba(0, 191, 255, 0.3);
            border-color: #87CEEB;
          }
          100% {
            box-shadow: 0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5);
            border-color: #40E0D0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gpu-accelerated,
          .gpu-optimized-text,
          .timing-elastic-out {
            animation: none !important;
            transition: opacity 0.2s ease-in-out !important;
          }
        }
      `}</style>
    </div>
  );
};