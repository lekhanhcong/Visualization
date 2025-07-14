'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'


export function SubmarineCableSystemsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('submarine')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])


  return (
    <section 
      id="submarine" 
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
            SUBMARINE CABLE SYSTEMS
          </h2>

          {/* Description */}
          <p 
            className={`
              text-lg md:text-xl max-w-4xl mx-auto mb-8 leading-relaxed transition-all duration-1000 delay-300 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: 'var(--medium-gray)' }}
          >
            Hue Hi-Tech State Park, 80km from Da Nang Cable Landing Station, featuring 2 redundant international submarine cables
          </p>


          {/* Single Image Container - Full Width Auto Height */}
          <div 
            className={`
              relative w-screen
              transition-all duration-1000 delay-700 transform
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
              <Image
                src="/images/Connectivity_01.png"
                alt="Submarine cable connectivity system"
                width={1920}
                height={1080}
                className="w-full h-auto object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}