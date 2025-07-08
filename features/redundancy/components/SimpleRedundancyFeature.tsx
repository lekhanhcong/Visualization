/**
 * SimpleRedundancyFeature - Simplified 2N+1 redundancy visualization
 * Version 2: Background image swap with text overlay
 */

import React, { useState, useCallback } from 'react';
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
  const [isShowing2N1, setIsShowing2N1] = useState(false);
  const [imageConfig, setImageConfig] = useState<ImageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load image configuration
  React.useEffect(() => {
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
            '2n1': '/images/Power_2N1.png'
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

  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    
    // Add slight delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsShowing2N1(prev => !prev);
    setIsLoading(false);
  }, []);

  if (!imageConfig) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading image configuration...</div>
      </div>
    );
  }

  const currentImage = isShowing2N1 ? imageConfig.images['2n1'] : imageConfig.images.default;
  const buttonText = isShowing2N1 ? 'Main' : 'Show 2N+1 Redundancy';
  const textOverlay = imageConfig.textOverlays['2n1'];

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Background Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentImage}
          alt={isShowing2N1 ? "2N+1 Redundancy View" : "Main Power Infrastructure"}
          fill
          className={`object-contain transition-opacity duration-500 ${
            isLoading ? 'opacity-50' : 'opacity-100'
          }`}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Text Overlay for 2N+1 View */}
        {isShowing2N1 && (
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: textOverlay.position.x,
              top: textOverlay.position.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <div
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-white via-blue-50 to-cyan-50 backdrop-blur-lg border-2 border-cyan-300 shadow-2xl"
              style={{
                fontSize: 'clamp(16px, 2.2vw, 24px)', // Slightly larger for better visibility
                fontWeight: 'bold',
                color: '#0066CC', // Deep ocean blue for contrast
                textAlign: 'center',
                textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                animation: 'fadeInGlow 1.5s ease-out forwards, pulseGlow 3s ease-in-out infinite 1.5s',
                boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              {textOverlay.text}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          absolute top-4 left-4 z-20
          flex items-center gap-2 px-4 py-2
          bg-red-600 hover:bg-red-700 disabled:bg-red-400
          text-white font-semibold rounded-lg
          transition-all duration-200
          shadow-lg hover:shadow-xl
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={buttonText}
        data-testid="simple-redundancy-toggle"
      >
        <span className="whitespace-nowrap">
          {isLoading ? 'Loading...' : buttonText}
        </span>
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes oceanGlow {
          0% {
            text-shadow: 2px 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,191,255,0.5), 0 0 20px rgba(0,191,255,0.3);
            border-color: #00BFFF;
            transform: scale(1);
          }
          50% {
            text-shadow: 2px 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(0,191,255,0.8), 0 0 30px rgba(0,191,255,0.5), 0 0 40px rgba(0,191,255,0.3);
            border-color: #87CEEB;
            transform: scale(1.02);
          }
          100% {
            text-shadow: 2px 2px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,191,255,0.6), 0 0 35px rgba(0,191,255,0.4);
            border-color: #40E0D0;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};