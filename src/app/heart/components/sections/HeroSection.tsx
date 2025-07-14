'use client'

import { useState, useEffect } from 'react'

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section 
      id="hero" 
      className="w-full flex items-center justify-center"
      style={{ 
        background: '#FFFFFF',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        minHeight: '50vh'
      }}
    >
      <div className="max-w-6xl mx-auto px-5 text-center">
        <div 
          className={`
            transition-all duration-1000 transform
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900">
            HUE HI-TECH PARK
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-gray-800">
            Vietnam's First 300MW AI-Optimized Hyperscale Data Center
          </h2>
        </div>
      </div>
    </section>
  )
}