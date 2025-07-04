import { test, expect } from '@playwright/test'

test.describe('Data Validation', () => {
  test('should validate hotspots.json structure', async ({ request }) => {
    const response = await request.get('/data/hotspots.json')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('hotspots')
    expect(Array.isArray(data.hotspots)).toBe(true)

    data.hotspots.forEach((hotspot: any) => {
      expect(hotspot).toHaveProperty('id')
      expect(hotspot).toHaveProperty('name')
      expect(hotspot).toHaveProperty('type')
      expect(hotspot).toHaveProperty('position')
      expect(hotspot.position).toHaveProperty('x')
      expect(hotspot.position).toHaveProperty('y')
      expect(['substation', 'datacenter', 'powerplant']).toContain(hotspot.type)
    })
  })

  test('should validate image-config.json structure', async ({ request }) => {
    const response = await request.get('/data/image-config.json')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('originalWidth')
    expect(data).toHaveProperty('originalHeight')
    expect(data).toHaveProperty('aspectRatio')
    expect(data).toHaveProperty('legend')
    expect(typeof data.originalWidth).toBe('number')
    expect(typeof data.originalHeight).toBe('number')
  })

  test('should validate infrastructure-details.json structure', async ({
    request,
  }) => {
    const response = await request.get('/data/infrastructure-details.json')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('infrastructure')

    const infrastructure = data.infrastructure
    expect(infrastructure).toHaveProperty('datacenter')
    expect(infrastructure).toHaveProperty('substation-500kv')
    expect(infrastructure).toHaveProperty('la-son-substation')
    expect(infrastructure).toHaveProperty('ta-trach-plant')
  })
})
