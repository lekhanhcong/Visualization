export interface ImageHotspot {
  id: string
  name: string
  type: 'substation' | 'datacenter' | 'powerplant'
  position: {
    x: number // pixel position from top-left of image
    y: number // pixel position from top-left of image
  }
  description: string
  metadata?: {
    capacity?: string
    voltage?: string
    technology?: string
    status?: 'operational' | 'planned' | 'maintenance'
    coordinates?: string
  }
}

export interface ImageConfig {
  originalWidth: number // Original width of the image
  originalHeight: number // Original height of the image
  aspectRatio: number // Aspect ratio
  legend: {
    position: { x: number; y: number }
    width: number
    height: number
  }
}

export interface InfrastructurePoint {
  id: string
  name: string
  type: 'substation' | 'datacenter' | 'powerplant'
  capacity: string
  voltage?: string
  technology?: string
  status: 'operational' | 'planned'
  description: string
  coordinates: {
    lat: number
    lng: number
  }
  specifications: Record<string, string | number>
}

export type Theme = 'light' | 'dark' | 'system'

export interface UIPreferences {
  showTooltips: boolean
  showLegend: boolean
  showZoomControls: boolean
  showCoordinates: boolean
  enableSoundEffects: boolean
  autoHideUI: boolean
  compactMode: boolean
  animationSpeed: number
  fontSize: 'small' | 'medium' | 'large'
  colorScheme: 'default' | 'high-contrast' | 'colorblind'
}

export interface InfrastructureDetails {
  infrastructure: Record<
    string,
    {
      id: string
      name: string
      overview: string
      specifications: Record<string, string | number | boolean>
      equipment?: string[]
      features?: string[]
      connectivity?: string[]
      environmental?: string[]
    }
  >
}

export interface AnimationVariants {
  container: {
    hidden: { opacity: number }
    visible: {
      opacity: number
      transition: {
        staggerChildren: number
        delayChildren: number
      }
    }
  }
  item: {
    hidden: { y: number; opacity: number }
    visible: {
      y: number
      opacity: number
      transition: {
        type: string
        damping: number
        stiffness: number
      }
    }
  }
  powerLine: {
    initial: { pathLength: number; opacity: number }
    animate: {
      pathLength: number
      opacity: number
      transition: {
        pathLength: { duration: number; ease: string }
        opacity: { duration: number }
      }
    }
  }
}
