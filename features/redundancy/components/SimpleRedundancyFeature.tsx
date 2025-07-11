/**
 * SimpleRedundancyFeature - Infinite loop animation between Power.png and Power_2N1.png
 * Version 4: Infinite loop without progress indicator
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SimpleRedundancyFeatureProps {
  className?: string;
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

export const SimpleRedundancyFeature: React.FC<SimpleRedundancyFeatureProps> = ({ className = '' }) => {
  const [imageConfig, setImageConfig] = useState<ImageConfig | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isForwardDirection, setIsForwardDirection] = useState(true);

  // Load image configuration
  useEffect(() => {
    const loadImageConfig = async () => {
      try {
        const response = await fetch('/data/image-config.json');
        const config = await response.json();
        setImageConfig(config);
      } catch (error) {
        console.error('Failed to load image config:', error);
        // Fallback configuration
        setImageConfig({
          images: {
            default: '/images/Power.png',
            '2n1': '/images/Power_2N1.PNG'
          },
          textOverlays: {
            '2n1': {
              text: '500KV ONSITE GRID',
              position: { x: '50%', y: '85%' },
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#00BFFF',
                textAlign: 'center',
                textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,191,255,0.5)'
              }
            }
          }
        });
      }
    };

    loadImageConfig();
  }, []);

  // Infinite loop animation effect
  useEffect(() => {
    if (!imageConfig) return;

    const animationDuration = 3000; // 3 seconds each direction
    let animationFrameId: number;
    let startTime: number;

    const animateLoop = () => {
      if (!startTime) {
        startTime = Date.now();
      }

      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / animationDuration, 1);
      
      // Use easing function for smooth transition
      const easedProgress = easeInOutCubic(progress);
      
      // Set progress based on direction
      const currentProgress = isForwardDirection ? easedProgress : 1 - easedProgress;
      setAnimationProgress(currentProgress);

      if (progress >= 1) {
        // Animation cycle complete, switch direction
        setIsForwardDirection(prev => !prev);
        startTime = Date.now(); // Reset timer
        progress = 0;
      }

      animationFrameId = requestAnimationFrame(animateLoop);
    };

    // Start animation after initial delay
    const timer = setTimeout(() => {
      requestAnimationFrame(animateLoop);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [imageConfig, isForwardDirection]);

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  if (!imageConfig) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading image configuration...</div>
      </div>
    );
  }

  const textOverlay = imageConfig.textOverlays['2n1'];
  const showTextOverlay = animationProgress > 0.5; // Show text after 50% of animation
  const textOpacity = showTextOverlay ? (animationProgress - 0.5) * 2 : 0; // Fade in text

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Image Container with both images */}
      <div className="relative w-full h-full">
        {/* Power.png - Default image (fades out/in) */}
        <Image
          src={imageConfig.images.default}
          alt="Main Power Infrastructure"
          fill
          className="object-contain absolute inset-0"
          style={{
            opacity: 1 - animationProgress,
            transition: 'none' // Using JS animation instead of CSS
          }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Power_2N1.png - 2N+1 image (fades in/out) */}
        <Image
          src={imageConfig.images['2n1']}
          alt="2N+1 Redundancy View"
          fill
          className="object-contain absolute inset-0"
          style={{
            opacity: animationProgress,
            transition: 'none' // Using JS animation instead of CSS
          }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Text Overlay for 2N+1 View */}
        {showTextOverlay && (
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: textOverlay.position.x,
              top: textOverlay.position.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              opacity: Math.min(textOpacity, 1)
            }}
          >
            <div
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-white via-blue-50 to-cyan-50 backdrop-blur-lg border-2 border-cyan-300 shadow-2xl"
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
      `}</style>
    </div>
  );
};