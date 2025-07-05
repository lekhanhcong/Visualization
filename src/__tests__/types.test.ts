import { ImageHotspot, ImageConfig, InfrastructureDetails } from '@/types'

describe('TypeScript Interfaces', () => {
  describe('ImageHotspot interface', () => {
    it('should accept valid ImageHotspot data', () => {
      const validHotspot: ImageHotspot = {
        id: 'test-hotspot',
        name: 'Test Hotspot',
        type: 'datacenter',
        description: 'Test description',
        position: { x: 100, y: 200 },
        metadata: { test: 'data' },
      }

      expect(validHotspot.id).toBe('test-hotspot')
      expect(validHotspot.name).toBe('Test Hotspot')
      expect(validHotspot.type).toBe('datacenter')
      expect(validHotspot.position.x).toBe(100)
      expect(validHotspot.position.y).toBe(200)
    })

    it('should support all hotspot types', () => {
      const types: Array<ImageHotspot['type']> = [
        'datacenter',
        'substation',
        'powerplant',
      ]

      types.forEach((type) => {
        const hotspot: ImageHotspot = {
          id: `test-${type}`,
          name: `Test ${type}`,
          type,
          description: 'Test description',
          position: { x: 0, y: 0 },
          metadata: {},
        }

        expect(hotspot.type).toBe(type)
      })
    })

    it('should handle optional metadata', () => {
      const hotspotWithoutMetadata: ImageHotspot = {
        id: 'test',
        name: 'Test',
        type: 'datacenter',
        description: 'Test',
        position: { x: 0, y: 0 },
        metadata: {},
      }

      const hotspotWithMetadata: ImageHotspot = {
        id: 'test',
        name: 'Test',
        type: 'datacenter',
        description: 'Test',
        position: { x: 0, y: 0 },
        metadata: {
          capacity: '300MW',
          status: 'operational' as const,
        },
      }

      expect(hotspotWithoutMetadata.metadata).toEqual({})
      expect(hotspotWithMetadata.metadata?.capacity).toBe('300MW')
    })
  })

  describe('ImageConfig interface', () => {
    it('should accept valid ImageConfig data', () => {
      const validConfig: ImageConfig = {
        originalWidth: 1200,
        originalHeight: 800,
        aspectRatio: 1.5,
        legend: {
          position: { x: 50, y: 650 },
          width: 300,
          height: 120,
        },
      }

      expect(validConfig.originalWidth).toBe(1200)
      expect(validConfig.originalHeight).toBe(800)
      expect(validConfig.aspectRatio).toBe(1.5)
      expect(validConfig.legend.position.x).toBe(50)
      expect(validConfig.legend.width).toBe(300)
    })

    it('should calculate aspect ratio correctly', () => {
      const config: ImageConfig = {
        originalWidth: 1920,
        originalHeight: 1080,
        aspectRatio: 1920 / 1080,
        legend: {
          position: { x: 0, y: 0 },
          width: 200,
          height: 100,
        },
      }

      expect(config.aspectRatio).toBeCloseTo(1.778, 2)
    })

    it('should handle different legend configurations', () => {
      const configBottomLeft: ImageConfig = {
        originalWidth: 1200,
        originalHeight: 800,
        aspectRatio: 1.5,
        legend: {
          position: { x: 50, y: 650 },
          width: 300,
          height: 120,
        },
      }

      const configTopRight: ImageConfig = {
        originalWidth: 1200,
        originalHeight: 800,
        aspectRatio: 1.5,
        legend: {
          position: { x: 850, y: 50 },
          width: 300,
          height: 120,
        },
      }

      expect(configBottomLeft.legend.position.y).toBe(650)
      expect(configTopRight.legend.position.y).toBe(50)
    })
  })

  describe('InfrastructureDetails interface', () => {
    it('should accept valid infrastructure details', () => {
      const validDetails: InfrastructureDetails = {
        infrastructure: {
          datacenter: {
            id: 'datacenter',
            name: 'Test Data Center',
            overview: 'Test overview',
            specifications: {
              totalCapacity: '300MW',
              powerSupply: '220kV/110kV dual feed',
            },
            features: ['Feature 1', 'Feature 2'],
            connectivity: ['Connection 1', 'Connection 2'],
          },
        },
      }

      expect(validDetails.infrastructure.datacenter?.id).toBe('datacenter')
      expect(
        validDetails.infrastructure.datacenter?.specifications.totalCapacity
      ).toBe('300MW')
      expect(validDetails.infrastructure.datacenter?.features).toHaveLength(2)
    })

    it('should support multiple infrastructure types', () => {
      const details: InfrastructureDetails = {
        infrastructure: {
          datacenter: {
            id: 'datacenter',
            name: 'Data Center',
            overview: 'Overview',
            specifications: {},
            features: [],
            connectivity: [],
          },
          'substation-500kv': {
            id: 'substation-500kv',
            name: '500kV Substation',
            overview: 'Substation overview',
            specifications: {},
            features: [],
            connectivity: [],
          },
          'hydro-plant': {
            id: 'hydro-plant',
            name: 'Hydro Plant',
            overview: 'Plant overview',
            specifications: {},
            features: [],
            connectivity: [],
          },
        },
      }

      expect(Object.keys(details.infrastructure)).toHaveLength(3)
      expect(details.infrastructure['datacenter']).toBeDefined()
      expect(details.infrastructure['substation-500kv']).toBeDefined()
      expect(details.infrastructure['hydro-plant']).toBeDefined()
    })

    it('should handle complex specifications', () => {
      const details: InfrastructureDetails = {
        infrastructure: {
          datacenter: {
            id: 'datacenter',
            name: 'Hue Hi Tech Park Data Center',
            overview: 'Advanced AI data center',
            specifications: {
              totalCapacity: '300MW',
              powerSupply: '220kV/110kV dual feed',
              redundancy: 'N+1 UPS and generator backup',
              coolingSystem: 'Advanced liquid cooling',
              rackDensity: 'Up to 50kW per rack',
              floorSpace: '50,000 m²',
              efficiency: 'PUE < 1.15',
              certifications: ['Tier III', 'ISO 27001', 'SOC 2'],
            },
            features: [
              'Advanced AI workload optimization',
              'Real-time power monitoring',
              'Automated cooling management',
            ],
            connectivity: [
              'Direct connection to 500kV transmission grid',
              'Redundant 220kV and 110kV power feeds',
            ],
          },
        },
      }

      const datacenter = details.infrastructure.datacenter
      expect(datacenter?.specifications.totalCapacity).toBe('300MW')
      expect(datacenter?.specifications.certifications).toContain('Tier III')
      expect(datacenter?.features).toContain('Advanced AI workload optimization')
      expect(datacenter?.connectivity).toHaveLength(2)
    })
  })

  describe('Type validation edge cases', () => {
    it('should handle empty position coordinates', () => {
      const hotspot: ImageHotspot = {
        id: 'origin',
        name: 'Origin Point',
        type: 'datacenter',
        description: 'Point at origin',
        position: { x: 0, y: 0 },
        metadata: {},
      }

      expect(hotspot.position.x).toBe(0)
      expect(hotspot.position.y).toBe(0)
    })

    it('should handle large coordinate values', () => {
      const hotspot: ImageHotspot = {
        id: 'large-coords',
        name: 'Large Coordinates',
        type: 'datacenter',
        description: 'Large coordinate values',
        position: { x: 9999, y: 9999 },
        metadata: {},
      }

      expect(hotspot.position.x).toBe(9999)
      expect(hotspot.position.y).toBe(9999)
    })

    it('should handle decimal aspect ratios', () => {
      const config: ImageConfig = {
        originalWidth: 1366,
        originalHeight: 768,
        aspectRatio: 1366 / 768,
        legend: {
          position: { x: 100, y: 600 },
          width: 250,
          height: 100,
        },
      }

      expect(config.aspectRatio).toBeCloseTo(1.779, 2)
    })
  })
})
