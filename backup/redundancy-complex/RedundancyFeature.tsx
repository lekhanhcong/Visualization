/**
 * RedundancyFeature - Main feature component
 * Wraps the redundancy overlay with provider
 * Enhanced with input validation for security
 */

import React, { useMemo } from 'react';
import { RedundancyProvider } from './components/RedundancyProvider';
import { RedundancyOverlay } from './components/RedundancyOverlay';
import { ValidationError } from './validation/schemas';

interface RedundancyFeatureProps {
  isVisible?: boolean;
  onClose?: () => void;
  animationDuration?: number;
}

/**
 * Validate props for security
 */
function validateProps(props: RedundancyFeatureProps): RedundancyFeatureProps {
  const { isVisible = false, onClose, animationDuration } = props;

  // Safe validation - preserve actual values
  const safeIsVisible = typeof isVisible === 'boolean' ? isVisible : false;
  const safeOnClose = typeof onClose === 'function' ? onClose : () => {};
  const safeAnimationDuration = typeof animationDuration === 'number' && 
    animationDuration >= 1000 && animationDuration <= 30000 ? 
    animationDuration : 4000;

  return {
    isVisible: safeIsVisible,
    onClose: safeOnClose,
    animationDuration: safeAnimationDuration
  };
}

export const RedundancyFeature: React.FC<RedundancyFeatureProps> = (props) => {
  // Validate props for security
  const validatedProps = useMemo(() => {
    return validateProps(props);
  }, [props]);

  const { isVisible, onClose } = validatedProps;

  return (
    <RedundancyProvider>
      <RedundancyOverlay 
        isVisible={isVisible}
        onClose={onClose}
      />
    </RedundancyProvider>
  );
};