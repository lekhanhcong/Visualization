'use client'

export function TransportationSection() {
  return (
    <section 
      id="transportation" 
      className="bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Optimized compact 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* AIR Column - Optimized */}
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold mb-3 text-black">AIR</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-black">Phu Bai Airport</p>
                <p className="text-xs text-black">Located in Hue City serving domestic and regional flights</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-black">Da Nang International Airport</p>
                <p className="text-xs text-black">A major international hub 80km from the site</p>
              </div>
            </div>
          </div>

          {/* LAND Column - Optimized */}
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold mb-3 text-black">LAND</h3>
            <div className="space-y-1 text-black text-xs">
              <p>• Direct access to North-South Expressway</p>
              <p>• Adjacent to National Highway 1A</p>
              <p>• Connected to coastal roads</p>
              <p>• Strategic position in Central Vietnam</p>
              <p>• Future highway expansions planned</p>
            </div>
          </div>

          {/* SEA Column - Optimized */}
          <div className="bg-white p-4">
            <h3 className="text-xl font-bold mb-3 text-black">SEA</h3>
            <div className="space-y-2 text-black text-xs">
              <p className="mb-2">Near to major seaports, for general and containerised trade, as well as speciality shipping</p>
              <div className="space-y-1">
                <p>• Chan May Port</p>
                <p>• Thuan An Port</p>
                <p>• Da Nang Port (regional hub)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}