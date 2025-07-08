'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function DebugImages() {
  const [imageConfig, setImageConfig] = useState<any>(null)
  const [imageStatuses, setImageStatuses] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Load image config
    fetch('/data/image-config.json')
      .then(res => res.json())
      .then(config => {
        setImageConfig(config)
        console.log('Image config loaded:', config)
      })
      .catch(err => {
        console.error('Failed to load image config:', err)
        setImageConfig({
          images: {
            default: '/images/Power.png',
            '2n1': '/images/Power_2N1.png'
          }
        })
      })
  }, [])

  const testImageLoad = (src: string, key: string) => {
    const img = new Image()
    img.onload = () => {
      setImageStatuses(prev => ({ ...prev, [key]: `✅ Loaded (${img.naturalWidth}x${img.naturalHeight})` }))
    }
    img.onerror = () => {
      setImageStatuses(prev => ({ ...prev, [key]: '❌ Failed to load' }))
    }
    img.src = src
  }

  useEffect(() => {
    if (imageConfig) {
      // Test direct image paths
      testImageLoad('/images/Power.png', 'power-direct')
      testImageLoad('/images/Power_2N1.png', 'power2n1-direct')
      
      // Test config paths
      testImageLoad(imageConfig.images.default, 'power-config')
      testImageLoad(imageConfig.images['2n1'], 'power2n1-config')
    }
  }, [imageConfig])

  if (!imageConfig) {
    return <div className="p-8">Loading image config...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Image Debug Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>NEXT_PUBLIC_ENABLE_REDUNDANCY: {process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY}</p>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Image Config</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(imageConfig, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct Image Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Power.png (Direct)</h3>
            <p className="text-sm text-gray-600">/images/Power.png</p>
            <p className="text-sm">{imageStatuses['power-direct'] || 'Testing...'}</p>
            <div className="mt-2 w-64 h-40 relative border">
              <Image
                src="/images/Power.png"
                alt="Power Direct Test"
                fill
                className="object-contain"
                onLoad={() => console.log('Power.png loaded via Next.js Image')}
                onError={() => console.log('Power.png failed via Next.js Image')}
              />
            </div>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-semibold">Power_2N1.png (Direct)</h3>
            <p className="text-sm text-gray-600">/images/Power_2N1.png</p>
            <p className="text-sm">{imageStatuses['power2n1-direct'] || 'Testing...'}</p>
            <div className="mt-2 w-64 h-40 relative border">
              <Image
                src="/images/Power_2N1.png"
                alt="Power 2N1 Direct Test"
                fill
                className="object-contain"
                onLoad={() => console.log('Power_2N1.png loaded via Next.js Image')}
                onError={() => console.log('Power_2N1.png failed via Next.js Image')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Config-based Image Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Default (Config)</h3>
            <p className="text-sm text-gray-600">{imageConfig.images.default}</p>
            <p className="text-sm">{imageStatuses['power-config'] || 'Testing...'}</p>
            <div className="mt-2 w-64 h-40 relative border">
              <Image
                src={imageConfig.images.default}
                alt="Power Config Test"
                fill
                className="object-contain"
                onLoad={() => console.log('Power config loaded via Next.js Image')}
                onError={() => console.log('Power config failed via Next.js Image')}
              />
            </div>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-semibold">2N+1 (Config)</h3>
            <p className="text-sm text-gray-600">{imageConfig.images['2n1']}</p>
            <p className="text-sm">{imageStatuses['power2n1-config'] || 'Testing...'}</p>
            <div className="mt-2 w-64 h-40 relative border">
              <Image
                src={imageConfig.images['2n1']}
                alt="Power 2N1 Config Test"
                fill
                className="object-contain"
                onLoad={() => console.log('Power_2N1 config loaded via Next.js Image')}
                onError={() => console.log('Power_2N1 config failed via Next.js Image')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Raw HTML img Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Power.png (Raw)</h3>
            <img 
              src="/images/Power.png" 
              alt="Power Raw Test"
              style={{ maxWidth: '200px', maxHeight: '150px' }}
              onLoad={() => console.log('Power.png raw img loaded')}
              onError={() => console.log('Power.png raw img failed')}
            />
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Power_2N1.png (Raw)</h3>
            <img 
              src="/images/Power_2N1.png" 
              alt="Power 2N1 Raw Test"
              style={{ maxWidth: '200px', maxHeight: '150px' }}
              onLoad={() => console.log('Power_2N1.png raw img loaded')}
              onError={() => console.log('Power_2N1.png raw img failed')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}