'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function TransportationSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('transportation')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="transportation" 
      className="flex items-center justify-center"
      style={{ 
        background: '#FFFFFF',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        minHeight: '40vh'
      }}
    >
      <div className="w-full">
        

        {/* Three Column Layout - Full Width Text Only */}
        <div 
          className="w-screen py-16"
          style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw', background: '#FFFFFF' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto px-8">
            
            {/* AIR Column */}
            <div 
              className={`
                bg-white p-8 transition-all duration-1000 delay-300 transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <h3 className="text-3xl font-bold mb-6 text-black">AIR</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-lg text-black">Phu Bai Airport</p>
                  <p className="text-black">Located in Hue City serving domestic and regional flights</p>
                </div>
                <div>
                  <p className="font-semibold text-lg text-black">Da Nang International Airport</p>
                  <p className="text-black">A major international hub 80km from the site</p>
                </div>
              </div>
            </div>

            {/* LAND Column */}
            <div 
              className={`
                bg-white p-8 transition-all duration-1000 delay-400 transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <h3 className="text-3xl font-bold mb-6 text-black">LAND</h3>
              <div className="space-y-2 text-black">
                <p>• Direct access to North-South Expressway</p>
                <p>• Adjacent to National Highway 1A</p>
                <p>• Connected to coastal roads</p>
                <p>• Strategic position in Central Vietnam</p>
                <p>• Future highway expansions planned</p>
              </div>
            </div>

            {/* SEA Column */}
            <div 
              className={`
                bg-white p-8 transition-all duration-1000 delay-500 transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <h3 className="text-3xl font-bold mb-6 text-black">SEA</h3>
              <div className="space-y-3 text-black">
                <p className="mb-3">Near to major seaports, for general and containerised trade, as well as speciality shipping</p>
                <div className="space-y-1">
                  <p>• Chan May Port</p>
                  <p>• Thuan An Port</p>
                  <p>• Da Nang Port (regional hub)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}