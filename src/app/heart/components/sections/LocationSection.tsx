'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function LocationSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('location')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="location" 
      className="flex items-center justify-center"
      style={{ 
        background: '#FFFFFF',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        minHeight: '70vh'
      }}
    >
      <div className="w-full">
        <div className="text-center">
          
          {/* Title */}
          <h2 
            className={`
              text-2xl md:text-3xl font-bold mb-8 transition-all duration-1000 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--dark-gray)' }}
          >
            LOCATION
          </h2>

          {/* Description */}
          <p 
            className={`
              text-lg md:text-xl max-w-4xl mx-auto mb-8 leading-relaxed transition-all duration-1000 delay-300 transform px-5
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--medium-gray)' }}
          >
            Strategically positioned in Hue Hi-Tech State-owned Park, 500kV onsite grid with 4 existing lines + Connect to Da Nang's international submarine cables.
          </p>
        </div>

        {/* Single Image - Full Width Auto Height */}
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
            src="/images/location_01.png"
            alt="Strategic location in Hue Hi-Tech Park"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain"
            sizes="100vw"
            priority
          />
        </div>

      </div>
    </section>
  )
}