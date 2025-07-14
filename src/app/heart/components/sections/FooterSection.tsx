'use client'

export function FooterSection() {
  return (
    <footer 
      className="py-12"
      style={{ background: '#4A7C59' }}
    >
      <div className="max-w-7xl mx-auto px-5">
        
        {/* Main Content */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            HEART
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            POWERING AI WITH 500KV ONSITE GRID
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-white/80 text-sm">
            © 2025 Hue Ecological AI-Robotics Town | Hue Hi-Tech Park (Project Code: HUE-DC-300MW-2024). All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}