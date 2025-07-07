/**
 * RedundancyOverlay - Professional 2N+1 redundancy visualization overlay
 * Complete implementation with all visual effects from the original component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RedundancyOverlayProps } from '../types';
import { useRedundancy } from './RedundancyProvider';
import { InfoPanel } from './InfoPanel';
import { SubstationMarker } from './SubstationMarker';
import { LineHighlight } from './LineHighlight';
import { PowerFlowAnimation } from './PowerFlowAnimation';

export const RedundancyOverlay: React.FC<RedundancyOverlayProps> = ({
  isVisible,
  onClose
}) => {
  console.log('[RedundancyOverlay] Rendering with isVisible:', isVisible);
  
  const { state, config, stats, substations, lines, actions } = useRedundancy();
  const animationDuration = config?.animations?.pulse?.duration || 4000;
  
  // Debug logging for stats object
  console.log('[RedundancyOverlay] Stats object:', stats);
  
  // Fallback stats if undefined
  const safeStats = stats || {
    dataCenterNeeds: '300MW',
    activeNow: { sources: [], capacity: '0MW' },
    standbyReady: { sources: [], capacity: '0MW' },
    totalCapacity: '0MW',
    redundancyRatio: '0%'
  };
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previouslyFocusedElement, setPreviouslyFocusedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    console.log('[RedundancyOverlay] Component mounted');
  }, []);

  useEffect(() => {
    console.log('[RedundancyOverlay] isVisible changed to:', isVisible);
  }, [isVisible]);

  // Handle keyboard and accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'Tab':
          // Allow tab navigation within modal
          const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
          const focusableElements = modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    if (isVisible) {
      // Store currently focused element
      const activeElement = document.activeElement as HTMLElement;
      setPreviouslyFocusedElement(activeElement);
      
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // Focus the close button when modal opens
      setTimeout(() => {
        const closeButton = document.querySelector('[data-testid="close-redundancy-button"]') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      if (previouslyFocusedElement) {
        setTimeout(() => {
          previouslyFocusedElement.focus();
        }, 100);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible, onClose, previouslyFocusedElement]);

  // Animation sequence
  useEffect(() => {
    if (!isVisible) {
      setAnimationStep(0);
      setShowInfoPanel(false);
      return undefined;
    }

    // Modern animation sequence with configurable timing
    const stepDuration = animationDuration / 4;
    const timeouts = [
      setTimeout(() => setAnimationStep(1), stepDuration * 0.25),  // Lines appear
      setTimeout(() => setAnimationStep(2), stepDuration * 0.75), // Substations appear
      setTimeout(() => setAnimationStep(3), stepDuration * 1.25), // Connections appear
      setTimeout(() => setShowInfoPanel(true), stepDuration * 1.5) // Info panel appears
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [isVisible, animationDuration]);

  console.log('[RedundancyOverlay] Render check - mounted:', mounted, 'isVisible:', isVisible);
  
  if (!mounted || !isVisible) {
    console.log('[RedundancyOverlay] Not rendering - returning null');
    return null;
  }
  
  console.log('[RedundancyOverlay] Rendering overlay content');

  const overlayContent = (
    <div
      ref={overlayRef}
      className={`${config.cssPrefix}overlay fixed inset-0 z-[9999] overflow-hidden`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="redundancy-title"
      aria-describedby="redundancy-description"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center text-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Close redundancy visualization"
        data-testid="close-redundancy-button"
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.2s ease 0.2s'
        }}
      >
        ×
      </button>

      {/* Transmission Lines SVG */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 10 }}
      >
        <defs>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Line 1: Quảng Trạch to Sub 01 (Active) */}
        {animationStep >= 1 && (
          <g>
            <path
              d="M 200,150 Q 350,100 500,200"
              stroke="#ef4444"
              strokeWidth="4"
              fill="none"
              filter="url(#glow-red)"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: animationStep >= 1 ? '0' : '1000',
                transition: 'stroke-dashoffset 1s ease'
              }}
            />
            <text 
              x="350" 
              y="120" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold" 
              textAnchor="middle"
              style={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'opacity 0.3s ease 0.5s'
              }}
            >
              Quảng Trạch → Sub 01
            </text>
          </g>
        )}

        {/* Line 2: Thanh Mỹ to Sub 01 (Active) */}
        {animationStep >= 1 && (
          <g>
            <path
              d="M 150,300 Q 300,250 500,200"
              stroke="#ef4444"
              strokeWidth="4"
              fill="none"
              filter="url(#glow-red)"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: animationStep >= 1 ? '0' : '1000',
                transition: 'stroke-dashoffset 1s ease 0.2s'
              }}
            />
            <text 
              x="300" 
              y="280" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold" 
              textAnchor="middle"
              style={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'opacity 0.3s ease 0.7s'
              }}
            >
              Thanh Mỹ → Sub 01
            </text>
          </g>
        )}

        {/* Line 3: Quảng Trị to Sub 02 (Standby) */}
        {animationStep >= 1 && (
          <g>
            <path
              d="M 250,100 Q 400,150 600,250"
              stroke="#fbbf24"
              strokeWidth="4"
              fill="none"
              filter="url(#glow-yellow)"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: animationStep >= 1 ? '0' : '1000',
                transition: 'stroke-dashoffset 1s ease 0.4s'
              }}
            />
            <text 
              x="400" 
              y="140" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold" 
              textAnchor="middle"
              style={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'opacity 0.3s ease 0.9s'
              }}
            >
              Quảng Trị → Sub 02
            </text>
          </g>
        )}

        {/* Line 4: Đà Nẵng to Sub 02 (Standby) */}
        {animationStep >= 1 && (
          <g>
            <path
              d="M 400,350 Q 500,300 600,250"
              stroke="#fbbf24"
              strokeWidth="4"
              fill="none"
              filter="url(#glow-yellow)"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: animationStep >= 1 ? '0' : '1000',
                transition: 'stroke-dashoffset 1s ease 0.6s'
              }}
            />
            <text 
              x="500" 
              y="340" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold" 
              textAnchor="middle"
              style={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                opacity: animationStep >= 1 ? 1 : 0,
                transition: 'opacity 0.3s ease 1.1s'
              }}
            >
              Đà Nẵng → Sub 02
            </text>
          </g>
        )}

        {/* Connection line between substations */}
        {animationStep >= 3 && (
          <g>
            <path
              d="M 500,200 L 600,250"
              stroke="#8b5cf6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: animationStep >= 3 ? '0' : '1000',
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
            <text 
              x="550" 
              y="215" 
              fill="#8b5cf6" 
              fontSize="10" 
              fontWeight="bold" 
              textAnchor="middle"
              style={{
                opacity: animationStep >= 3 ? 1 : 0,
                transition: 'opacity 0.3s ease 0.3s'
              }}
            >
              220kV Backup
            </text>
          </g>
        )}
      </svg>

      {/* Substation 01 Marker */}
      {animationStep >= 2 && (
        <div 
          className="absolute z-20"
          style={{
            left: '500px',
            top: '200px',
            transform: 'translate(-50%, -50%)',
            opacity: animationStep >= 2 ? 1 : 0,
            scale: animationStep >= 2 ? 1 : 0.8,
            transition: 'all 0.5s ease'
          }}
        >
          <div className="relative">
            <div 
              className="w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg" 
              style={{
                animation: 'pulse 2s infinite'
              }}
            />
            <div 
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
              style={{
                opacity: animationStep >= 2 ? 1 : 0,
                transform: `translateX(-50%) translateY(${animationStep >= 2 ? '0' : '-10px'})`,
                transition: 'all 0.3s ease 0.3s'
              }}
            >
              SUBSTATION 01 - ACTIVE
            </div>
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center"
              style={{
                scale: animationStep >= 2 ? 1 : 0,
                transition: 'scale 0.5s ease 0.5s'
              }}
            >
              <span className="text-white text-xs font-bold">●</span>
            </div>
          </div>
        </div>
      )}

      {/* Substation 02 Marker */}
      {animationStep >= 2 && (
        <div 
          className="absolute z-20"
          style={{
            left: '600px',
            top: '250px',
            transform: 'translate(-50%, -50%)',
            opacity: animationStep >= 2 ? 1 : 0,
            scale: animationStep >= 2 ? 1 : 0.8,
            transition: 'all 0.5s ease 0.2s'
          }}
        >
          <div className="relative">
            <div 
              className="w-6 h-6 bg-yellow-500 border-2 border-white rounded-full shadow-lg" 
              style={{
                animation: 'pulse 3s infinite'
              }}
            />
            <div 
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
              style={{
                opacity: animationStep >= 2 ? 1 : 0,
                transform: `translateX(-50%) translateY(${animationStep >= 2 ? '0' : '-10px'})`,
                transition: 'all 0.3s ease 0.3s'
              }}
            >
              SUBSTATION 02 - 600MW STANDBY
            </div>
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center"
              style={{
                scale: animationStep >= 2 ? 1 : 0,
                transition: 'scale 0.5s ease 0.5s'
              }}
            >
              <span className="text-white text-xs font-bold">◐</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {showInfoPanel && (
        <div 
          className="absolute top-5 right-16 z-30 bg-black bg-opacity-90 text-white p-5 rounded-xl max-w-sm backdrop-blur-sm border border-gray-600"
          id="redundancy-description"
          style={{
            opacity: showInfoPanel ? 1 : 0,
            transform: `scale(${showInfoPanel ? 1 : 0.8}) translateY(${showInfoPanel ? '0' : '20px'})`,
            transition: 'all 0.3s ease'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" id="redundancy-title">
              <span className="text-xl" role="img" aria-label="lightning">⚡</span>
              2N+1 Redundancy Status
            </h3>
            <button
              onClick={() => setShowInfoPanel(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Data Center Needs */}
            <div>
              <div className="text-yellow-400 font-semibold mb-1">Data Center Needs</div>
              <div className="text-2xl font-bold text-red-400">{safeStats.dataCenterNeeds}</div>
            </div>

            {/* Active Now */}
            <div>
              <div className="text-green-400 font-semibold mb-2">Active Now</div>
              {safeStats.activeNow.sources.map((source, index) => (
                <div 
                  key={index} 
                  className="ml-2 mb-1"
                  style={{
                    opacity: showInfoPanel ? 1 : 0,
                    transform: `translateX(${showInfoPanel ? '0' : '-20px'})`,
                    transition: `all 0.3s ease ${index * 0.1}s`
                  }}
                >
                  • {source}
                </div>
              ))}
              <div className="font-semibold mt-1">Total: {safeStats.activeNow.capacity}</div>
            </div>

            {/* Standby Ready */}
            <div>
              <div className="text-yellow-400 font-semibold mb-2">Standby Ready</div>
              {safeStats.standbyReady.sources.map((source, index) => (
                <div 
                  key={index} 
                  className="ml-2 mb-1"
                  style={{
                    opacity: showInfoPanel ? 1 : 0,
                    transform: `translateX(${showInfoPanel ? '0' : '-20px'})`,
                    transition: `all 0.3s ease ${0.2 + index * 0.1}s`
                  }}
                >
                  • {source}
                </div>
              ))}
              <div className="font-semibold mt-1">Total: {safeStats.standbyReady.capacity}</div>
            </div>

            {/* Total Capacity */}
            <div className="border-t border-gray-600 pt-4 text-center">
              <div 
                className="text-lg font-bold text-red-400"
                style={{
                  scale: showInfoPanel ? 1 : 0.8,
                  transition: 'scale 0.5s ease 0.5s'
                }}
              >
                {safeStats.redundancyRatio} TOTAL CAPACITY
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Total Available: {safeStats.totalCapacity}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Help */}
      <div 
        className="absolute bottom-5 left-5 z-30 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-xs"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? '0' : '20px'})`,
          transition: 'all 0.3s ease 1s'
        }}
      >
        Press ESC to close
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );

  return createPortal(overlayContent, document.body);
};