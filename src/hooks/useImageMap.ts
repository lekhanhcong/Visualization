'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ImageConfig, ImageHotspot, InfrastructureDetails } from '@/types'

interface UseImageMapOptions {
  enableLogging?: boolean
  retryAttempts?: number
  retryDelay?: number
}

interface UseImageMapReturn {
  // Data
  hotspots: ImageHotspot[]
  imageConfig: ImageConfig | null
  infrastructureDetails: InfrastructureDetails | null

  // Loading states
  isLoading: boolean
  isHotspotsLoading: boolean
  isConfigLoading: boolean
  isDetailsLoading: boolean

  // Error states
  error: Error | null
  hotspotsError: Error | null
  configError: Error | null
  detailsError: Error | null

  // Actions
  refetch: () => Promise<void>
  clearErrors: () => void

  // Computed values
  isReady: boolean
  hasErrors: boolean
}

export function useImageMap(
  options: UseImageMapOptions = {}
): UseImageMapReturn {
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    retryAttempts = 3,
    retryDelay = 1000,
  } = options

  // State
  const [hotspots, setHotspots] = useState<ImageHotspot[]>([])
  const [imageConfig, setImageConfig] = useState<ImageConfig | null>(null)
  const [infrastructureDetails, setInfrastructureDetails] =
    useState<InfrastructureDetails | null>(null)

  // Loading states
  const [isHotspotsLoading, setIsHotspotsLoading] = useState(false)
  const [isConfigLoading, setIsConfigLoading] = useState(false)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Error states
  const [hotspotsError, setHotspotsError] = useState<Error | null>(null)
  const [configError, setConfigError] = useState<Error | null>(null)
  const [detailsError, setDetailsError] = useState<Error | null>(null)

  // Utility function for logging
  const log = useCallback(
    (message: string, data?: unknown) => {
      if (enableLogging) {
        console.log(`[useImageMap] ${message}`, data)
      }
    },
    [enableLogging]
  )

  // Fetch with retry logic
  const fetchWithRetry = useCallback(
    async <T>(
      url: string,
      parser: (data: unknown) => T,
      attempts = retryAttempts
    ): Promise<T> => {
      for (let i = 0; i < attempts; i++) {
        try {
          log(`Fetching ${url} (attempt ${i + 1}/${attempts})`)

          const response = await fetch(url)

          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${url}: ${response.status} ${response.statusText}`
            )
          }

          const data = await response.json()
          const parsed = parser(data)

          log(`Successfully fetched ${url}`, parsed)
          return parsed
        } catch (error) {
          log(`Error fetching ${url} (attempt ${i + 1}): ${error}`)

          if (i === attempts - 1) {
            throw error
          }

          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (i + 1))
          )
        }
      }

      throw new Error(`Failed to fetch ${url} after ${attempts} attempts`)
    },
    [retryAttempts, retryDelay, log]
  )

  // Validate and parse hotspots data
  const parseHotspots = useCallback((data: unknown): ImageHotspot[] => {
    if (!data || typeof data !== 'object' || data === null) {
      throw new Error('Invalid hotspots data structure')
    }

    const dataObj = data as Record<string, unknown>
    if (!Array.isArray(dataObj.hotspots)) {
      throw new Error('Invalid hotspots data structure')
    }

    return dataObj.hotspots.map((hotspot: unknown, index: number) => {
      if (!hotspot || typeof hotspot !== 'object' || hotspot === null) {
        throw new Error(`Invalid hotspot data at index ${index}`)
      }

      const hotspotObj = hotspot as Record<string, unknown>
      if (
        !hotspotObj.id ||
        !hotspotObj.name ||
        !hotspotObj.type ||
        !hotspotObj.position
      ) {
        throw new Error(`Invalid hotspot data at index ${index}`)
      }

      const position = hotspotObj.position as Record<string, unknown>
      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error(`Invalid position data for hotspot ${hotspotObj.id}`)
      }

      return {
        id: hotspotObj.id as string,
        name: hotspotObj.name as string,
        type: hotspotObj.type as 'substation' | 'datacenter' | 'powerplant',
        description: (hotspotObj.description as string) || '',
        position: {
          x: position.x as number,
          y: position.y as number,
        },
        metadata: (hotspotObj.metadata as Record<string, unknown>) || {},
      } as ImageHotspot
    })
  }, [])

  // Validate and parse image config
  const parseImageConfig = useCallback((data: unknown): ImageConfig => {
    if (!data || typeof data !== 'object' || data === null) {
      throw new Error('Invalid image config data structure')
    }

    const dataObj = data as Record<string, unknown>
    if (
      typeof dataObj.originalWidth !== 'number' ||
      typeof dataObj.originalHeight !== 'number'
    ) {
      throw new Error('Invalid image config data structure')
    }

    return {
      originalWidth: dataObj.originalWidth,
      originalHeight: dataObj.originalHeight,
      aspectRatio:
        (dataObj.aspectRatio as number) ||
        dataObj.originalWidth / dataObj.originalHeight,
      legend: (dataObj.legend as ImageConfig['legend']) || {
        position: { x: 50, y: 650 },
        width: 300,
        height: 120,
      },
    }
  }, [])

  // Validate and parse infrastructure details
  const parseInfrastructureDetails = useCallback(
    (data: unknown): InfrastructureDetails => {
      if (!data || typeof data !== 'object' || data === null) {
        throw new Error('Invalid infrastructure details data structure')
      }

      const dataObj = data as Record<string, unknown>
      if (!dataObj.infrastructure) {
        throw new Error('Invalid infrastructure details data structure')
      }

      return data as InfrastructureDetails
    },
    []
  )

  // Fetch hotspots
  const fetchHotspots = useCallback(async () => {
    setIsHotspotsLoading(true)
    setHotspotsError(null)

    try {
      const data = await fetchWithRetry('/data/hotspots.json', parseHotspots)
      setHotspots(data)
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to fetch hotspots')
      setHotspotsError(err)
      log('Error fetching hotspots', err)
    } finally {
      setIsHotspotsLoading(false)
    }
  }, [fetchWithRetry, parseHotspots, log])

  // Fetch image config
  const fetchImageConfig = useCallback(async () => {
    setIsConfigLoading(true)
    setConfigError(null)

    try {
      const data = await fetchWithRetry(
        '/data/image-config.json',
        parseImageConfig
      )
      setImageConfig(data)
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to fetch image config')
      setConfigError(err)
      log('Error fetching image config', err)
    } finally {
      setIsConfigLoading(false)
    }
  }, [fetchWithRetry, parseImageConfig, log])

  // Fetch infrastructure details
  const fetchInfrastructureDetails = useCallback(async () => {
    setIsDetailsLoading(true)
    setDetailsError(null)

    try {
      const data = await fetchWithRetry(
        '/data/infrastructure-details.json',
        parseInfrastructureDetails
      )
      setInfrastructureDetails(data)
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to fetch infrastructure details')
      setDetailsError(err)
      log('Error fetching infrastructure details', err)
    } finally {
      setIsDetailsLoading(false)
    }
  }, [fetchWithRetry, parseInfrastructureDetails, log])

  // Refetch all data
  const refetch = useCallback(async () => {
    log('Refetching all data')
    await Promise.all([
      fetchHotspots(),
      fetchImageConfig(),
      fetchInfrastructureDetails(),
    ])
  }, [fetchHotspots, fetchImageConfig, fetchInfrastructureDetails, log])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setHotspotsError(null)
    setConfigError(null)
    setDetailsError(null)
  }, [])

  // Initial data fetch
  useEffect(() => {
    log('Initial data fetch')
    refetch()
  }, [])

  // Computed values
  const isLoading = useMemo(
    () => isHotspotsLoading || isConfigLoading || isDetailsLoading,
    [isHotspotsLoading, isConfigLoading, isDetailsLoading]
  )

  const error = useMemo(
    () => hotspotsError || configError || detailsError,
    [hotspotsError, configError, detailsError]
  )

  const hasErrors = useMemo(
    () => !!(hotspotsError || configError || detailsError),
    [hotspotsError, configError, detailsError]
  )

  const isReady = useMemo(
    () =>
      !isLoading && !hasErrors && hotspots.length > 0 && imageConfig !== null,
    [isLoading, hasErrors, hotspots.length, imageConfig]
  )

  return {
    // Data
    hotspots,
    imageConfig,
    infrastructureDetails,

    // Loading states
    isLoading,
    isHotspotsLoading,
    isConfigLoading,
    isDetailsLoading,

    // Error states
    error,
    hotspotsError,
    configError,
    detailsError,

    // Actions
    refetch,
    clearErrors,

    // Computed values
    isReady,
    hasErrors,
  }
}
