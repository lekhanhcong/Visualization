export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          🎉 Server hoạt động tốt!
        </h1>
        <p className="text-gray-600">
          Hue Hi Tech Park - 300MW AI Data Center Visualization
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Test Page - Port: {typeof window !== 'undefined' ? window.location.port : '3001'}
        </p>
      </div>
    </div>
  )
}