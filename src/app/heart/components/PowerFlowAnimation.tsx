'use client'

import { useEffect, useRef } from 'react'

interface PowerFlowAnimationProps {
  isActive: boolean
}

export function PowerFlowAnimation({ isActive }: PowerFlowAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let animationTime = 0

    // Colors matching the image exactly
    const colors = {
      '500kV': '#E53E3E', // Red for 500kV lines
      '220kV': '#3182CE', // Blue for 220kV
      'substation': '#4A5568', // Gray for substations
      'datacenter': '#38A169' // Green for data centers
    }

    // Get canvas dimensions
    const getCanvasWidth = () => canvas ? canvas.width / window.devicePixelRatio : 800
    const getCanvasHeight = () => canvas ? canvas.height / window.devicePixelRatio : 600

    // Exact layout from Power_animation.png
    const getPowerLines = () => {
      const width = getCanvasWidth()
      const height = getCanvasHeight()
      
      return [
        // 4 horizontal 500kV lines (500KV LINE 01-04) - shifted more right
        { start: { x: width * 0.17, y: height * 0.20 }, end: { x: width * 0.86, y: height * 0.20 }, voltage: '500kV', id: 'line01' },
        { start: { x: width * 0.17, y: height * 0.26 }, end: { x: width * 0.86, y: height * 0.26 }, voltage: '500kV', id: 'line02' },
        { start: { x: width * 0.17, y: height * 0.32 }, end: { x: width * 0.86, y: height * 0.32 }, voltage: '500kV', id: 'line03' },
        { start: { x: width * 0.17, y: height * 0.38 }, end: { x: width * 0.86, y: height * 0.38 }, voltage: '500kV', id: 'line04' },
        
        // Vertical connections from 500kV lines to substations - shifted more right
        { start: { x: width * 0.36, y: height * 0.29 }, end: { x: width * 0.36, y: height * 0.48 }, voltage: '500kV', id: 'vert01' },
        { start: { x: width * 0.67, y: height * 0.29 }, end: { x: width * 0.67, y: height * 0.48 }, voltage: '500kV', id: 'vert02' },
        
        // 220kV horizontal distribution line - moved down for better harmony
        { start: { x: width * 0.21, y: height * 0.65 }, end: { x: width * 0.86, y: height * 0.65 }, voltage: '220kV', id: 'dist220' },
        
        // Vertical drops from substations to 220kV line - adjusted for new position
        { start: { x: width * 0.36, y: height * 0.55 }, end: { x: width * 0.36, y: height * 0.65 }, voltage: '220kV', id: 'drop01' },
        { start: { x: width * 0.67, y: height * 0.55 }, end: { x: width * 0.67, y: height * 0.65 }, voltage: '220kV', id: 'drop02' },
        
        // Vertical drops to data centers - adjusted for new 220kV line position
        { start: { x: width * 0.30, y: height * 0.65 }, end: { x: width * 0.30, y: height * 0.80 }, voltage: '220kV', id: 'dc01' },
        { start: { x: width * 0.52, y: height * 0.65 }, end: { x: width * 0.52, y: height * 0.80 }, voltage: '220kV', id: 'dc02' },
        { start: { x: width * 0.74, y: height * 0.65 }, end: { x: width * 0.74, y: height * 0.80 }, voltage: '220kV', id: 'dc03' }
      ]
    }

    // Infrastructure elements
    const getInfrastructure = () => {
      const width = getCanvasWidth()
      const height = getCanvasHeight()
      
      return [
        // Substations - shifted more right for optimal balance
        { x: width * 0.36, y: height * 0.515, label: 'SUBSTATION 01\n500/220kV\n2 x 600MVA', type: 'substation', id: 'sub01' },
        { x: width * 0.67, y: height * 0.515, label: 'SUBSTATION 02\n500/220kV\n2 x 600MVA', type: 'substation', id: 'sub02' },
        
        // Data Centers - shifted more right with perfect spacing
        { x: width * 0.30, y: height * 0.90, label: 'DATA CENTER 01\n100MW\n22kV', type: 'datacenter', id: 'dc01' },
        { x: width * 0.52, y: height * 0.90, label: 'DATA CENTER 02\n100MW\n22kV', type: 'datacenter', id: 'dc02' },
        { x: width * 0.74, y: height * 0.90, label: 'DATA CENTER 03\n101MW\n22kV', type: 'datacenter', id: 'dc03' }
      ]
    }

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return

      const width = getCanvasWidth()
      const height = getCanvasHeight()

      // Clear canvas with white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)

      // Get current data
      const powerLines = getPowerLines()
      const infrastructure = getInfrastructure()

      // Draw power lines first
      powerLines.forEach(line => {
        ctx.strokeStyle = colors[line.voltage]
        ctx.lineWidth = line.voltage === '500kV' ? 6 : 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(line.start.x, line.start.y)
        ctx.lineTo(line.end.x, line.end.y)
        ctx.stroke()

        // Add animated dots for horizontal 500kV lines (slower speed)
        if (line.id?.includes('line') && line.start.y === line.end.y) {
          for (let i = 0; i < 3; i++) {
            const progress = ((animationTime * 0.3 + i * 40) % 120) / 120
            const dotX = line.start.x + (line.end.x - line.start.x) * progress
            const dotY = line.start.y
            
            ctx.fillStyle = 'white'
            ctx.strokeStyle = colors[line.voltage]
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
          }
        }

        // Add connection points
        if (line.id?.includes('vert') || line.id?.includes('drop')) {
          ctx.fillStyle = colors[line.voltage]
          ctx.beginPath()
          ctx.arc(line.start.x, line.start.y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw infrastructure
      infrastructure.forEach(item => {
        const isDatacenter = item.type === 'datacenter'
        const boxWidth = isDatacenter ? 200 : 240
        const boxHeight = isDatacenter ? 80 : 100
        
        // Draw main box
        ctx.fillStyle = 'white'
        ctx.strokeStyle = isDatacenter ? colors.datacenter : colors.substation
        ctx.lineWidth = 3
        ctx.fillRect(item.x - boxWidth/2, item.y - boxHeight/2, boxWidth, boxHeight)
        ctx.strokeRect(item.x - boxWidth/2, item.y - boxHeight/2, boxWidth, boxHeight)

        // Draw labels
        const lines = item.label.split('\n')
        lines.forEach((line, index) => {
          if (index === 0) {
            // Title
            ctx.fillStyle = colors.substation
            ctx.font = 'bold 14px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(line, item.x, item.y - 20)
          } else if (index === 1) {
            // Voltage/Power
            ctx.fillStyle = isDatacenter ? colors.datacenter : colors['500kV']
            ctx.font = 'bold 20px Arial'
            ctx.fillText(line, item.x, item.y + 5)
          } else {
            // Capacity
            ctx.fillStyle = '#666666'
            ctx.font = '12px Arial'
            ctx.fillText(line, item.x, item.y + 25)
          }
        })

        // Draw output labels for substations
        if (!isDatacenter) {
          ctx.fillStyle = colors['220kV']
          ctx.fillRect(item.x - 40, item.y + boxHeight/2 + 10, 80, 25)
          ctx.fillStyle = 'white'
          ctx.font = 'bold 12px Arial'
          ctx.fillText('220kV OUT', item.x, item.y + boxHeight/2 + 27)
        }
      })

      // Draw 500kV line labels AFTER drawing lines
      const lineLabels = ['500KV LINE 01', '500KV LINE 02', '500KV LINE 03', '500KV LINE 04']
      lineLabels.forEach((label, index) => {
        const y = height * (0.20 + index * 0.06)
        
        // Draw label background on the right side - smaller size
        ctx.fillStyle = colors['500kV']
        ctx.fillRect(width * 0.87, y - 10, width * 0.12, 20)
        
        // Draw label text - smaller font
        ctx.fillStyle = 'white'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(label, width * 0.93, y + 3)
      })

      animationTime++
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isActive])

  if (!isActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Power flow animation will start when in view</p>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: '#FFFFFF' }}
    />
  )
}