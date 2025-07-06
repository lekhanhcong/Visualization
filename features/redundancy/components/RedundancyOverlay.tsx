/**
 * RedundancyOverlay - Main overlay component for 2N+1 redundancy visualization
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RedundancyOverlayProps } from '../types';
import { useRedundancy } from './RedundancyProvider';

export const RedundancyOverlay: React.FC<RedundancyOverlayProps> = ({
  isVisible,
  onClose,
  animationPhase
}) => {
  const { state, config, stats, substations, lines, actions } = useRedundancy();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animationStep, setAnimationStep] = useState(0);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  // Animation sequence
  useEffect(() => {
    if (!isVisible) {
      setAnimationStep(0);
      return;
    }

    const timeouts = [
      setTimeout(() => setAnimationStep(1), 500),
      setTimeout(() => setAnimationStep(2), 1500),
      setTimeout(() => setAnimationStep(3), 2500),
      setTimeout(() => actions.openInfoPanel(), 3000)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [isVisible, actions]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className={`${config.cssPrefix}overlay`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: config.zIndex.overlay,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div>2N+1 Redundancy Visualization - Step {animationStep}</div>
    </div>
  );
};