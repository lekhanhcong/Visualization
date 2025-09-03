'use client'

import { useEffect } from 'react'
import { Navigation } from './Navigation'
import { HeroSection } from './sections/HeroSection'
import { LocationSection } from './sections/LocationSection'
import { TransportationSection } from './sections/TransportationSection'
import { DataCenterZonesSection } from './sections/DataCenterZonesSection'
import { ElectricityInfrastructureSection } from './sections/ElectricityInfrastructureSection'
import { RedundancySection } from './sections/RedundancySection'
import { SubmarineCableSystemsSection } from './sections/SubmarineCableSystemsSection'
import { FooterSection } from './sections/FooterSection'

export function HeartWebsite() {
  useEffect(() => {
    // Preload critical images for better First Contentful Paint
    const criticalImages = [
      '/images/location_01.png',
      '/images/Connectivity_01.png', 
      '/images/Power_01.png',
      '/images/Datacenter.png'
    ]
    
    criticalImages.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content - Optimized with minimal spacing */}
      <main className="scroll-smooth">
        {/* All sections load immediately - optimized for performance */}
        <HeroSection />
        <LocationSection />
        <TransportationSection />
        <DataCenterZonesSection />
        <ElectricityInfrastructureSection />
        <RedundancySection />
        <SubmarineCableSystemsSection />
        
        {/* Footer - no gap with last section */}
        <FooterSection />
      </main>
    </div>
  )
}