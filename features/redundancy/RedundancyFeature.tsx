/**
 * RedundancyFeature - Main feature component
 * Wraps the redundancy overlay with provider
 */

import React from 'react';
import { RedundancyProvider } from './components/RedundancyProvider';
import { RedundancyOverlay } from './components/RedundancyOverlay';

interface RedundancyFeatureProps {
  isVisible?: boolean;
  onClose?: () => void;
  animationDuration?: number;
}

export const RedundancyFeature: React.FC<RedundancyFeatureProps> = ({ 
  isVisible = false, 
  onClose = () => {}, 
  animationDuration = 4000 
}) => {
  return (
    <RedundancyProvider>
      <RedundancyOverlay 
        isVisible={isVisible}
        onClose={onClose}
      />
    </RedundancyProvider>
  );
};