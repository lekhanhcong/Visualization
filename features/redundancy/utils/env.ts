/**
 * Environment variable utilities for redundancy feature
 */

export function isRedundancyEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY
  return flag === 'true'
}

export function getFeatureFlag(): string | undefined {
  return process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY
}

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const flag = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY

  if (flag === undefined) {
    errors.push('NEXT_PUBLIC_ENABLE_REDUNDANCY is not defined')
  } else if (flag !== 'true' && flag !== 'false') {
    errors.push('NEXT_PUBLIC_ENABLE_REDUNDANCY must be "true" or "false"')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
