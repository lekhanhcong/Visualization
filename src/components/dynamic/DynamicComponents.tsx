'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading component for code splitting
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
      Loading component...
    </span>
  </div>
)

// Dynamically imported components for code splitting
export const DynamicImageMapContainer = dynamic(
  () =>
    import('@/components/organisms/ImageMapContainer').then((mod) => ({
      default: mod.ImageMapContainer,
    })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for this component as it uses client-side interactions
  }
)

export const DynamicInfoModal = dynamic(
  () =>
    import('@/components/molecules/InfoModal').then((mod) => ({
      default: mod.InfoModal,
    })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicPerformanceMonitor = dynamic(
  () =>
    import('@/components/atoms/PerformanceMonitor').then((mod) => ({
      default: mod.PerformanceMonitor,
    })),
  {
    loading: () => <div></div>, // Silent loading for performance monitor
    ssr: false,
  }
)

export const DynamicThemeToggle = dynamic(
  () =>
    import('@/components/atoms/ThemeToggle').then((mod) => ({
      default: mod.ThemeToggle,
    })),
  {
    loading: () => (
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    ),
    ssr: false,
  }
)

export const DynamicInteractiveOverlay = dynamic(
  () =>
    import('@/components/molecules/InteractiveOverlay').then((mod) => ({
      default: mod.InteractiveOverlay,
    })),
  {
    loading: () => <div className="absolute inset-0 bg-transparent" />,
    ssr: false,
  }
)

// Lazy loaded utility components
export const DynamicErrorBoundary = dynamic(
  () =>
    import('@/components/organisms/ErrorBoundary').then((mod) => ({
      default: mod.ErrorBoundary,
    })),
  {
    loading: () => <div>Loading error handler...</div>,
  }
)

// Animation components (heavy dependencies)
export const DynamicAnimationContainer = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.div })),
  {
    loading: () => <div />,
    ssr: false,
  }
)

// Query-related components
export const DynamicQueryProvider = dynamic(
  () =>
    import('@/providers/QueryProvider').then((mod) => ({
      default: mod.QueryProvider,
    })),
  {
    loading: () => <div>Loading data provider...</div>,
  }
)

// Chart/visualization components (if added in future)
// export const DynamicChartComponents = {
//   BarChart: dynamic(
//     () => import('recharts').then(mod => ({ default: mod.BarChart })),
//     {
//       loading: () => <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />,
//       ssr: false,
//     }
//   ),
//   LineChart: dynamic(
//     () => import('recharts').then(mod => ({ default: mod.LineChart })),
//     {
//       loading: () => <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />,
//       ssr: false,
//     }
//   ),
// }

// Development-only components
export const DynamicDevTools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((mod) => ({
      default: mod.ReactQueryDevtools,
    })),
  {
    loading: () => <div />,
    ssr: false,
  }
)

// Bundle analyzer component for development
// export const DynamicBundleAnalyzer = dynamic(
//   () => {
//     if (process.env.NODE_ENV === 'development') {
//       return import('@/components/dev/BundleAnalyzer').then(mod => ({ default: mod.BundleAnalyzer }))
//     }
//     return Promise.resolve({ default: () => null })
//   },
//   {
//     loading: () => <div />,
//     ssr: false,
//   }
// )

// Lazy loaded forms and complex UI (commented out - not implemented)
// export const DynamicComplexForms = {
//   ContactForm: dynamic(
//     () => import('@/components/forms/ContactForm'),
//     {
//       loading: () => (
//         <div className="space-y-4">
//           <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
//           <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
//           <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
//         </div>
//       ),
//       ssr: false,
//     }
//   ),
//   FeedbackForm: dynamic(
//     () => import('@/components/forms/FeedbackForm'),
//     {
//       loading: () => <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />,
//       ssr: false,
//     }
//   ),
// }

// Advanced features that can be loaded on demand (commented out - not implemented)
// export const DynamicAdvancedFeatures = {
//   DataExporter: dynamic(
//     () => import('@/components/features/DataExporter'),
//     {
//       loading: () => <div className="p-4 text-center">Loading export tools...</div>,
//       ssr: false,
//     }
//   ),
//   AdvancedFilters: dynamic(
//     () => import('@/components/features/AdvancedFilters'),
//     {
//       loading: () => <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />,
//       ssr: false,
//     }
//   ),
//   ReportGenerator: dynamic(
//     () => import('@/components/features/ReportGenerator'),
//     {
//       loading: () => <div className="p-8 text-center">Loading report generator...</div>,
//       ssr: false,
//     }
//   ),
// }

// Third-party integrations (commented out - not implemented)
// export const DynamicThirdPartyIntegrations = {
//   GoogleMaps: dynamic(
//     () => import('@/components/integrations/GoogleMaps'),
//     {
//       loading: () => <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />,
//       ssr: false,
//     }
//   ),
//   Analytics: dynamic(
//     () => import('@/components/integrations/Analytics'),
//     {
//       loading: () => <div />,
//       ssr: false,
//     }
//   ),
// }

// Helper function to preload components
export const preloadComponents = {
  imageMap: () => import('@/components/organisms/ImageMapContainer'),
  modal: () => import('@/components/molecules/InfoModal'),
  theme: () => import('@/components/atoms/ThemeToggle'),
  performance: () => import('@/components/atoms/PerformanceMonitor'),
  animations: () => import('framer-motion'),
}

// Component size estimator for monitoring
export const componentSizes = {
  ImageMapContainer: '~25KB',
  InfoModal: '~15KB',
  ThemeToggle: '~8KB',
  PerformanceMonitor: '~12KB',
  InteractiveOverlay: '~18KB',
  ErrorBoundary: '~10KB',
  QueryProvider: '~20KB',
  Animations: '~100KB',
  DevTools: '~80KB',
}

// Usage tracker for optimization
export const trackComponentUsage = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Code Splitting] Loading component: ${componentName} (${componentSizes[componentName as keyof typeof componentSizes] || 'unknown size'})`
    )
  }
}
