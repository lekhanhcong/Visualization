'use client'

import { useEffect, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--white)'}}>
        <div className="animate-pulse text-xl" style={{color: 'var(--dark-gray)'}}>Loading HEART Website...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--white)'}}>
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content - Single Page with Scroll */}
      <main className="scroll-smooth">
        <HeroSection />
        <LocationSection />
        <TransportationSection />
        <DataCenterZonesSection />
        <ElectricityInfrastructureSection />
        <RedundancySection />
        <SubmarineCableSystemsSection />
      </main>
      
      {/* Footer */}
      <FooterSection />
    </div>
  )
}