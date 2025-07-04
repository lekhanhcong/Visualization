'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ImageConfig, ImageHotspot } from '@/types'
import { Hotspot } from '@/components/molecules/Hotspot'
import { InfoModal } from '@/components/molecules/InfoModal'
import { LegendPanel } from '@/components/molecules/LegendPanel'
import { InteractiveOverlay } from '@/components/molecules/InteractiveOverlay'

interface ImageMapContainerProps {
  imageConfig: ImageConfig
  hotspots: ImageHotspot[]
  className?: string
}

export function ImageMapContainer({
  imageConfig,
  hotspots,
  className = '',
}: ImageMapContainerProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<ImageHotspot | null>(
    null
  )
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  // Calculate responsive dimensions based on container and maintain aspect ratio
  const imageDimensions = useMemo(() => {
    if (!containerDimensions.width || !containerDimensions.height) {
      return {
        width: imageConfig.originalWidth,
        height: imageConfig.originalHeight,
      }
    }

    const containerAspectRatio =
      containerDimensions.width / containerDimensions.height
    const imageAspectRatio = imageConfig.aspectRatio

    let width: number
    let height: number

    if (containerAspectRatio > imageAspectRatio) {
      // Container is wider than image - fit to height
      height = containerDimensions.height
      width = height * imageAspectRatio
    } else {
      // Container is taller than image - fit to width
      width = containerDimensions.width
      height = width / imageAspectRatio
    }

    return { width, height }
  }, [containerDimensions, imageConfig])

  // Calculate hotspot positions based on image dimensions
  const calculateHotspotPosition = useCallback(
    (hotspot: ImageHotspot) => {
      const xPercent = (hotspot.position.x / imageConfig.originalWidth) * 100
      const yPercent = (hotspot.position.y / imageConfig.originalHeight) * 100

      return {
        left: `${xPercent}%`,
        top: `${yPercent}%`,
      }
    },
    [imageConfig]
  )

  // Handle hotspot click
  const handleHotspotClick = useCallback((hotspot: ImageHotspot) => {
    setSelectedHotspot(hotspot)
  }, [])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedHotspot(null)
  }, [])

  // Container ref callback to get dimensions
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      })

      resizeObserver.observe(node)

      // Initial dimensions
      setContainerDimensions({
        width: node.clientWidth,
        height: node.clientHeight,
      })

      return () => resizeObserver.disconnect()
    }
    return undefined
  }, [])

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(0.5, Math.min(3, prev + delta))
      return newZoom
    })
  }, [])

  // Handle pan
  const handlePan = useCallback((delta: { x: number; y: number }) => {
    setPanOffset((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }))
  }, [])

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Main container */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-slate-100 dark:bg-slate-900 rounded-lg shadow-lg"
      >
        {/* Interactive overlay for zoom/pan */}
        <InteractiveOverlay
          onZoom={handleZoom}
          onPan={handlePan}
          onReset={resetView}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
        />

        {/* Image container with zoom and pan transforms */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center',
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
        >
          {/* Background image */}
          <div
            className="relative"
            style={{
              width: imageDimensions.width,
              height: imageDimensions.height,
            }}
          >
            <Image
              src="/images/Power.png"
              alt="Hue Hi Tech Park Data Center Infrastructure Map"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />

            {/* Hotspots */}
            {hotspots.map((hotspot) => (
              <Hotspot
                key={hotspot.id}
                hotspot={hotspot}
                position={calculateHotspotPosition(hotspot)}
                onClick={() => handleHotspotClick(hotspot)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              />
            ))}
          </div>
        </motion.div>

        {/* Legend panel */}
        <LegendPanel
          position={imageConfig.legend.position}
          width={imageConfig.legend.width}
          className="absolute z-20"
        />

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <button
            onClick={() => handleZoom(0.2)}
            className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Zoom in"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Zoom out"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 12H6"
              />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Reset view"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Current zoom level indicator */}
        <div className="absolute bottom-4 right-4 z-30 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-md text-sm font-medium">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Info modal */}
      {selectedHotspot && (
        <InfoModal
          hotspot={selectedHotspot}
          onClose={handleModalClose}
          isOpen={!!selectedHotspot}
        />
      )}
    </div>
  )
}
