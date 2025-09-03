'use client'

export function SectionSkeleton() {
  return (
    <div className="py-10 animate-pulse bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function TransportationSkeleton() {
  return (
    <div className="py-10 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-4">
              <div className="h-6 bg-gray-200 rounded-md w-16 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-3 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-screen animate-pulse bg-gray-100">
      <div className="absolute inset-0 bg-gray-200"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 bg-gray-300 rounded-md w-96 mb-4 mx-auto"></div>
          <div className="h-6 bg-gray-300 rounded-md w-64 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export function LocationSkeleton() {
  return (
    <div className="py-10 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-96 mx-auto"></div>
        </div>
        <div className="bg-gray-200 rounded-lg h-96 w-full"></div>
      </div>
    </div>
  )
}