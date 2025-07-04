'use client'

import { Variants } from 'framer-motion'

// Container animation variants
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

// Staggered children animations
export const childVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Power line animation variants
export const powerLineVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
    strokeDasharray: '10 10',
    strokeDashoffset: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    strokeDashoffset: -20,
    transition: {
      pathLength: {
        duration: 2,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.5,
      },
      strokeDashoffset: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  hover: {
    opacity: 1,
    strokeWidth: 3,
    transition: {
      duration: 0.2,
    },
  },
}

// Pulse animation variants for substations
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
  },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.3,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

// Modal animation variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Backdrop animation variants
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// Hotspot marker animation variants
export const markerVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.2,
    rotate: 5,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 400,
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

// Legend animation variants
export const legendVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
}

// Theme transition variants
export const themeVariants: Variants = {
  light: {
    backgroundColor: '#ffffff',
    color: '#1f2937',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  dark: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// Loading animation variants
export const loadingVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
}

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

// Ripple effect variants
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5,
  },
  animate: {
    scale: 2.5,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Error animation variants
export const errorVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    },
  },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
}

// Success animation variants
export const successVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Utility function to create custom spring animations
export const createSpringAnimation = (
  damping = 20,
  stiffness = 300,
  duration = 0.5
): Record<string, unknown> => ({
  type: 'spring',
  damping,
  stiffness,
  duration,
})

// Utility function to create custom ease animations
export const createEaseAnimation = (
  duration = 0.3,
  ease = 'easeInOut'
): Record<string, unknown> => ({
  duration,
  ease,
})
