/**
 * RedundancyProvider - Context provider for 2N+1 redundancy feature
 * Manages global state and provides context to child components
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { RedundancyProviderProps, RedundancyState, RedundancyConfig, RedundancyStats, SubstationData, LineData } from '../types';

interface RedundancyContextType {
  state: RedundancyState;
  config: RedundancyConfig;
  stats: RedundancyStats;
  substations: SubstationData[];
  lines: LineData[];
  actions: {
    toggleVisibility: () => void;
    setAnimationPhase: (phase: string) => void;
    openInfoPanel: () => void;
    closeInfoPanel: () => void;
    selectSubstation: (substation: SubstationData | null) => void;
    selectLine: (line: LineData | null) => void;
    reset: () => void;
  };
}

const RedundancyContext = createContext<RedundancyContextType | undefined>(undefined);

export const useRedundancy = () => {
  const context = useContext(RedundancyContext);
  if (!context) {
    throw new Error('useRedundancy must be used within a RedundancyProvider');
  }
  return context;
};

const defaultConfig: RedundancyConfig = {
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional-grade power redundancy visualization',
  featureFlag: 'NEXT_PUBLIC_ENABLE_REDUNDANCY',
  colors: {
    active: '#ef4444',
    standby: '#fbbf24',
    connection: '#8b5cf6',
    glow: {
      intensity: 0.8,
      radius: 8
    }
  },
  animations: {
    overlay: {
      fadeIn: 500,
      sequence: {
        lines: 1000,
        substations: 2000,
        panel: 3000
      }
    },
    pulse: {
      duration: 2000,
      easing: 'ease-in-out'
    }
  },
  substations: {
    sub01: {
      name: 'SUBSTATION 01',
      status: 'ACTIVE',
      capacity: '500MW',
      position: 'existing',
      color: '#ef4444'
    },
    sub02: {
      name: 'SUBSTATION 02',
      status: 'STANDBY',
      capacity: '600MW',
      position: {
        relative: 'sub01',
        distance: '800m',
        direction: 'SE'
      },
      color: '#fbbf24'
    }
  },
  lines: [
    {
      id: 'line01',
      from: 'Quảng Trạch',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV'
    },
    {
      id: 'line02',
      from: 'Thanh Mỹ',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV'
    },
    {
      id: 'line03',
      from: 'Quảng Trị',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV'
    },
    {
      id: 'line04',
      from: 'Đà Nẵng',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV'
    }
  ],
  statistics: {
    dataCenterNeeds: '300MW',
    totalCapacity: '1200MW',
    redundancyRatio: '400%',
    activeCapacity: '500MW',
    standbyCapacity: '600MW'
  },
  cssPrefix: 'rdx-',
  zIndex: {
    backdrop: 1000,
    overlay: 1001,
    markers: 1002,
    panel: 1003,
    controls: 1004
  }
};

const defaultStats: RedundancyStats = {
  dataCenterNeeds: '300MW',
  activeNow: {
    sources: ['Quảng Trạch → Sub 01', 'Thanh Mỹ → Sub 01'],
    capacity: '500MW'
  },
  standbyReady: {
    sources: ['Quảng Trị → Sub 02', 'Đà Nẵng → Sub 02'],
    capacity: '600MW'
  },
  totalCapacity: '1200MW',
  redundancyRatio: '400%'
};

export const RedundancyProvider: React.FC<RedundancyProviderProps> = ({ 
  children, 
  config: userConfig = {} 
}) => {
  const [state, setState] = useState<RedundancyState>({
    isActive: false,
    selectedSubstation: null,
    selectedLine: null,
    isPanelOpen: false,
    animationProgress: 0,
    animationPhase: 'idle'
  });

  const config = useMemo(() => ({
    ...defaultConfig,
    ...userConfig
  }), [userConfig]);

  const substations = useMemo((): SubstationData[] => [
    {
      id: 'sub01',
      name: 'SUBSTATION 01',
      status: 'ACTIVE',
      capacity: '500MW',
      position: { x: 0, y: 0 }, // Will be calculated based on existing map
      color: config.colors.active,
      connections: ['line01', 'line02']
    },
    {
      id: 'sub02',
      name: 'SUBSTATION 02 - 600MW STANDBY',
      status: 'STANDBY',
      capacity: '600MW',
      position: { x: 0, y: 0 }, // Will be calculated as ~800m SE of Sub 01
      color: config.colors.standby,
      connections: ['line03', 'line04']
    }
  ], [config.colors]);

  const lines = useMemo((): LineData[] => [
    {
      id: 'line01',
      from: 'Quảng Trạch',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV',
      path: '', // Will be calculated from existing map
      color: config.colors.active,
      glowIntensity: config.colors.glow.intensity
    },
    {
      id: 'line02',
      from: 'Thanh Mỹ',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV',
      path: '', // Will be calculated from existing map
      color: config.colors.active,
      glowIntensity: config.colors.glow.intensity
    },
    {
      id: 'line03',
      from: 'Quảng Trị',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV',
      path: '', // Will be calculated from existing map
      color: config.colors.standby,
      glowIntensity: config.colors.glow.intensity
    },
    {
      id: 'line04',
      from: 'Đà Nẵng',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV',
      path: '', // Will be calculated from existing map
      color: config.colors.standby,
      glowIntensity: config.colors.glow.intensity
    }
  ], [config.colors]);

  const actions = useMemo(() => ({
    toggleVisibility: useCallback(() => {
      setState(prev => ({
        ...prev,
        isActive: !prev.isActive,
        animationPhase: !prev.isActive ? 'starting' : 'ending'
      }));
    }, []),

    setAnimationPhase: useCallback((phase: string) => {
      setState(prev => ({
        ...prev,
        animationPhase: phase
      }));
    }, []),

    openInfoPanel: useCallback(() => {
      setState(prev => ({
        ...prev,
        isPanelOpen: true
      }));
    }, []),

    closeInfoPanel: useCallback(() => {
      setState(prev => ({
        ...prev,
        isPanelOpen: false
      }));
    }, []),

    selectSubstation: useCallback((substation: SubstationData | null) => {
      setState(prev => ({
        ...prev,
        selectedSubstation: substation
      }));
    }, []),

    selectLine: useCallback((line: LineData | null) => {
      setState(prev => ({
        ...prev,
        selectedLine: line
      }));
    }, []),

    reset: useCallback(() => {
      setState({
        isActive: false,
        selectedSubstation: null,
        selectedLine: null,
        isPanelOpen: false,
        animationProgress: 0,
        animationPhase: 'idle'
      });
    }, [])
  }), []);

  const contextValue = useMemo(() => ({
    state,
    config,
    stats: defaultStats,
    substations,
    lines,
    actions
  }), [state, config, substations, lines, actions]);

  return (
    <RedundancyContext.Provider value={contextValue}>
      {children}
    </RedundancyContext.Provider>
  );
};