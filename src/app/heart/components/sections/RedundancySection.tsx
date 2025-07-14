'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const redundancyImages = [
  '/images/Power_01.png',
  '/images/Power_02.png'
]

export function RedundancySection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('redundancy')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % redundancyImages.length)
    }, 2000) // 2 seconds per image (2x faster)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section 
      id="redundancy" 
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
              text-2xl md:text-3xl font-bold mb-6 transition-all duration-1000 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--dark-gray)' }}
          >
            2N+1 REDUNDANCY SYSTEM
          </h2>

          {/* Description */}
          <p 
            className={`
              text-lg md:text-xl max-w-4xl mx-auto mb-6 leading-relaxed transition-all duration-1000 delay-300 transform px-5
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--medium-gray)' }}
          >
            Onsite 500kV grid infrastructure with dual transmission lines directly crossing project boundary ensures uninterrupted power supply.
          </p>
        </div>

        {/* Image Animation Container - Full Width Auto Height */}
        <div 
          className={`
            relative w-screen
            transition-all duration-1000 delay-500 transform
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
          style={{ 
            marginLeft: 'calc(-50vw + 50%)', 
            marginRight: 'calc(-50vw + 50%)', 
            width: '100vw',
            zIndex: 1
          }}
        >
          <div className="relative w-full">
            {redundancyImages.map((imageSrc, index) => (
              <div
                key={imageSrc}
                className={`
                  ${index === currentImageIndex ? 'block' : 'hidden'}
                  w-full
                `}
              >
                <Image
                  src={imageSrc}
                  alt={`2N+1 Redundancy scenario ${index + 1}`}
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-contain"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            ))}
            
          </div>
        </div>

      </div>
    </section>
  )
}