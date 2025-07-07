'use client'

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Test</h1>
      <div className="space-y-2">
        <p>NEXT_PUBLIC_ENABLE_REDUNDANCY: {process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY || 'undefined'}</p>
        <p>Type: {typeof process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY}</p>
        <p>Is true?: {process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true' ? 'YES' : 'NO'}</p>
      </div>
    </div>
  )
}