/**
 * RedundancyButton - Trigger button for 2N+1 redundancy visualization
 */

import React from 'react';
import { RedundancyButtonProps } from '../types';
import { useRedundancy } from './RedundancyProvider';

export const RedundancyButton: React.FC<RedundancyButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const { state, config, actions } = useRedundancy();

  const baseStyles = {
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '12px 24px',
    fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: variant === 'primary' ? '#ef4444' : '#6b7280',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(0)',
    opacity: state.isActive ? 0.8 : 1
  };

  const handleClick = () => {
    actions.toggleVisibility();
  };

  return (
    <button
      className={`${config.cssPrefix}button ${className}`}
      style={baseStyles}
      onClick={handleClick}
      disabled={state.isActive}
      aria-label={state.isActive ? 'Close redundancy visualization' : 'Show 2N+1 redundancy visualization'}
      onMouseEnter={(e) => {
        if (!state.isActive) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!state.isActive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <span style={{ fontSize: '20px' }}>⚡</span>
      {state.isActive ? 'Close Redundancy View' : 'Show 2N+1 Redundancy'}
    </button>
  );
};