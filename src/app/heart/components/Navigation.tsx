'use client'

import { useState, useEffect } from 'react'

const navigationItems = [
  { id: 'hero', label: 'HOME' },
  { id: 'location', label: 'LOCATION' },
  { id: 'transportation', label: 'TRANSPORTATION' },
  { id: 'datacenter', label: 'DATA CENTER ZONES' },
  { id: 'electricity', label: 'ELECTRICITY' },
  { id: 'redundancy', label: '2N+1 REDUNDANCY' },
  { id: 'submarine', label: 'SUBMARINE CABLE SYSTEMS' },
]

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero')

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 90 // Navigation height
      const elementPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.id)
      const scrollPosition = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                HEART
              </h1>
              <p className="text-xs text-gray-600">
                Hue Ecological AI-Robotics Town
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  text-sm font-medium tracking-wide transition-all duration-300 ease-in-out
                  relative pb-1 border-b-3 transform hover:scale-105
                  ${activeSection === item.id 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                  }
                `}
                style={{
                  color: activeSection === item.id ? 'var(--primary-blue)' : 'var(--medium-gray)',
                  borderBottomColor: activeSection === item.id ? 'var(--primary-blue)' : 'transparent'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}