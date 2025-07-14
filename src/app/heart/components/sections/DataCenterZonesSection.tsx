'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function DataCenterZonesSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('datacenter')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="datacenter" 
      className="flex items-center justify-center"
      style={{ 
        background: '#FFFFFF',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        minHeight: '70vh'
      }}
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center">
          
          {/* Title */}
          <h2 
            className={`
              text-2xl md:text-3xl font-bold mb-8 transition-all duration-1000 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--dark-gray)' }}
          >
            DATA CENTER ZONES
          </h2>

          {/* Description */}
          <p 
            className={`
              text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-300 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--medium-gray)' }}
          >
            300MW Data center can be divided by 100MW each zones with 500kV substation will be built nearby 500kV existing lines. Scalability is available within 1081 ha.
          </p>

          {/* Data Center Image - Full Width Auto Height */}
          <div 
            className={`
              relative w-screen
              transition-all duration-1000 delay-500 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ 
              marginLeft: 'calc(-50vw + 50%)', 
              marginRight: 'calc(-50vw + 50%)', 
              width: '100vw'
            }}
          >
            <Image
              src="/images/Datacenter.png"
              alt="Data Center Zones Layout at Hue Hi-Tech Park"
              width={1920}
              height={1080}
              className="w-full h-auto object-contain"
              sizes="100vw"
            />
          </div>


        </div>
      </div>
    </section>
  )
}