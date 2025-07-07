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
            '2n1': '/images/Power_2N1.PNG'
          },
          textOverlays: {
            '2n1': {
              text: '500KV ONSITE GRID',
              position: { x: '50%', y: '85%' },
              style: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#FF0000',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
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
  const buttonText = isShowing2N1 ? 'Back to Main' : 'Show 2N+1 Redundancy';
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
              className="px-4 py-2 rounded-lg bg-black bg-opacity-60 backdrop-blur-sm border border-red-500"
              style={{
                ...textOverlay.style,
                fontSize: 'clamp(16px, 2.5vw, 28px)', // Responsive font size
                animation: 'fadeInScale 0.5s ease-out'
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
        <span className="text-lg" role="img" aria-label="lightning">⚡</span>
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
      `}</style>
    </div>
  );
};