/**
 * 2N+1 Redundancy Feature Configuration
 */

export const redundancyConfig = {
  // Feature metadata
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional investor-grade power redundancy visualization',

  // Feature flag
  featureFlag: 'NEXT_PUBLIC_ENABLE_REDUNDANCY',

  // Visual configuration
  colors: {
    active: '#ef4444', // Red for active lines
    standby: '#fbbf24', // Yellow for standby lines
    connection: '#8b5cf6', // Purple for interconnection
    glow: {
      intensity: 0.8,
      radius: 4,
    },
  },

  // Animation configuration
  animations: {
    overlay: {
      fadeIn: 1000, // 1s fade in
      sequence: {
        lines: 1000, // 1-2s lines highlight
        substations: 1000, // 2-3s substations appear
        panel: 1000, // 3-4s panel slide-in
      },
    },
    pulse: {
      duration: 2000,
      easing: 'ease-in-out',
    },
  },

  // Substation configuration
  substations: {
    sub01: {
      name: 'SUBSTATION 01',
      status: 'ACTIVE',
      capacity: '600MW',
      position: 'existing', // Use existing position on map
      color: '#ef4444',
    },
    sub02: {
      name: 'SUBSTATION 02',
      status: 'STANDBY',
      capacity: '600MW',
      position: {
        relative: 'sub01',
        distance: '800m',
        direction: 'SE',
      },
      color: '#fbbf24',
    },
  },

  // Line configuration
  lines: [
    {
      id: 'quang-trach-sub01',
      from: 'Quảng Trạch',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV',
    },
    {
      id: 'thanh-my-sub01',
      from: 'Thanh Mỹ',
      to: 'Substation 01',
      status: 'active',
      voltage: '500kV',
    },
    {
      id: 'quang-tri-sub02',
      from: 'Quảng Trị',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV',
    },
    {
      id: 'da-nang-sub02',
      from: 'Đà Nẵng',
      to: 'Substation 02',
      status: 'standby',
      voltage: '500kV',
    },
  ],

  // Statistics configuration
  statistics: {
    dataCenterNeeds: '300MW',
    totalCapacity: '1200MW',
    redundancyRatio: '400%',
    activeCapacity: '600MW',
    standbyCapacity: '600MW',
  },

  // CSS prefix for styling isolation
  cssPrefix: 'rdx-',

  // Z-index management
  zIndex: {
    overlay: 1000,
    backdrop: 999,
    panel: 1001,
    debugging: 9999,
  },
} as const
