const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analyzer
  experimental: {
    optimizeCss: true,
  },
  
  // Webpack configuration for advanced optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analysis configuration
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: isServer 
            ? '../analyze/server-stats.json' 
            : './analyze/client-stats.json',
        })
      )
    }
    
    // Optimization for 2N+1 redundancy feature
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate chunk for redundancy visualization
          redundancy: {
            test: /[\\/]src[\\/]components[\\/]Redundancy/,
            name: 'redundancy',
            chunks: 'all',
            priority: 10,
          },
          // Separate chunk for animations
          animations: {
            test: /framer-motion/,
            name: 'animations',
            chunks: 'all',
            priority: 8,
          },
          // Common vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
          },
        },
      },
    }
    
    // Tree shaking optimization
    config.optimization.usedExports = true
    config.optimization.sideEffects = false
    
    return config
  },
  
  // Compression and optimization
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance optimizations
  swcMinify: true,
  reactStrictMode: true,
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)