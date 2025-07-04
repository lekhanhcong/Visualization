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
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Staggered children animation variants
export const staggerChildrenVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Power line animation variants
export const powerLineVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 2,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  },
  active: {
    pathLength: 1,
    opacity: 1,
    stroke: '#10b981',
    transition: {
      stroke: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  },
}

// Pulse animation variants
export const pulseVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Hotspot marker animation variants
export const hotspotVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
      delay: 0.1,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 400,
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
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
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
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Tooltip animation variants
export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Loading animation variants
export const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Slide in animation variants
export const slideInVariants: Variants = {
  hidden: {
    x: -300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Fade in animation variants
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

// Zoom in animation variants
export const zoomInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Bounce animation variants
export const bounceVariants: Variants = {
  initial: {
    scale: 0.3,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
      bounce: 0.4,
    },
  },
}

// Power transmission animation variants
export const transmissionVariants: Variants = {
  idle: {
    strokeDasharray: '5,5',
    strokeDashoffset: 0,
  },
  active: {
    strokeDasharray: '5,5',
    strokeDashoffset: [0, -10],
    transition: {
      strokeDashoffset: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
}

// Infrastructure status animation variants
export const statusVariants: Variants = {
  operational: {
    backgroundColor: '#10b981',
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  warning: {
    backgroundColor: '#f59e0b',
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  critical: {
    backgroundColor: '#ef4444',
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  offline: {
    backgroundColor: '#6b7280',
    opacity: 0.6,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// Page transition variants
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}
