'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PowerFlowAnimation } from '../PowerFlowAnimation'

export function ElectricityInfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById('electricity')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="electricity" 
      className="flex items-center justify-center relative overflow-hidden"
      style={{ 
        background: '#FFFFFF',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        minHeight: '70vh'
      }}
    >
      <div className="max-w-6xl mx-auto px-5 relative z-10">
        <div className="text-center">
          
          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1 }}
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: 'var(--dark-gray)' }}
          >
            ELECTRICITY
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: 'var(--medium-gray)' }}
          >
            Hue Hi-Tech Park's 300MW data center has 04 existing 500kV lines crossing site boundary, with integrated 500/220/110kV substations and 2N+1 redundancy
          </motion.p>

        </div>

        {/* Power Flow Animation - Full Width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative w-screen h-[70vh] md:h-[80vh] bg-white overflow-hidden"
          style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}
        >
          <PowerFlowAnimation isActive={isVisible} />
        </motion.div>



      </div>
    </section>
  )
}