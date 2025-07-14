/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Performance optimizations (swcMinify is default in Next.js 13+)

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer (conditional)
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analyzer-report.html',
        })
      )
    }

    // Bundle splitting optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Vendor chunks for common libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            maxSize: 244000, // ~240KB
          },
          // Framer Motion chunk (large animation library)
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 20,
            chunks: 'all',
          },
          // React chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          // Feature chunks for plugin system
          redundancyFeature: {
            test: /[\\/]features[\\/]redundancy[\\/]/,
            name: 'redundancy-feature',
            priority: 15,
            chunks: 'all',
            minSize: 10000, // Only split if > 10KB
          },
          // Common utilities
          utils: {
            test: /[\\/]src[\\/](lib|utils)[\\/]/,
            name: 'utils',
            priority: 5,
            chunks: 'all',
            minChunks: 2, // Only if used in 2+ places
          },
        },
      }

      // Tree shaking optimizations
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    return config
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/data/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Rewrites for SPA behavior
  async rewrites() {
    return [
      {
        source: '/visualization',
        destination: '/',
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // ESLint configuration - disable during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration - skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Production optimizations - disable for development
  // ...(process.env.NODE_ENV === 'production' && {
  //   output: 'export',
  //   trailingSlash: true,
  //   images: { unoptimized: true },
  //   poweredByHeader: false,
  //   generateEtags: false,
  // }),
}

module.exports = nextConfig
