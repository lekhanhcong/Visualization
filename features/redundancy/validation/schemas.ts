/**
 * Input validation schemas for 2N+1 Redundancy Feature
 * Security-focused validation to prevent XSS and injection attacks
 */

// Simple validation utilities (avoiding external dependencies)
type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  sanitize?: boolean
}

type ValidationSchema = {
  [key: string]: ValidationRule
}

class ValidationError extends Error {
  constructor(field: string, rule: string) {
    super(`Validation failed for field '${field}': ${rule}`)
    this.name = 'ValidationError'
  }
}

/**
 * HTML entity encoding for XSS prevention
 */
function sanitizeHtml(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  
  return String(input).replace(/[&<>"'`=\/]/g, (s) => entityMap[s])
}

/**
 * Remove potentially dangerous scripts and attributes
 */
function stripDangerousContent(input: string): string {
  // Remove script tags
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove on* event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '')
  
  // Remove data: protocol (potential for XSS)
  cleaned = cleaned.replace(/data:/gi, '')
  
  return cleaned
}

/**
 * Validate a single field against its rule
 */
function validateField(value: any, rule: ValidationRule, fieldName: string): any {
  // Type validation
  if (rule.type && typeof value !== rule.type) {
    if (rule.type === 'array' && !Array.isArray(value)) {
      throw new ValidationError(fieldName, `Expected array, got ${typeof value}`)
    }
    if (rule.type !== 'array' && typeof value !== rule.type) {
      throw new ValidationError(fieldName, `Expected ${rule.type}, got ${typeof value}`)
    }
  }

  // Required validation
  if (rule.required && (value === undefined || value === null || value === '')) {
    throw new ValidationError(fieldName, 'Field is required')
  }

  // Skip further validation for null/undefined non-required fields
  if (!rule.required && (value === undefined || value === null)) {
    return value
  }

  // String-specific validations
  if (typeof value === 'string') {
    // Length validation
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      throw new ValidationError(fieldName, `Minimum length is ${rule.minLength}`)
    }
    
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      throw new ValidationError(fieldName, `Maximum length is ${rule.maxLength}`)
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      throw new ValidationError(fieldName, 'Pattern validation failed')
    }

    // Sanitization
    if (rule.sanitize) {
      value = stripDangerousContent(value)
      value = sanitizeHtml(value)
    }
  }

  return value
}

/**
 * Validate an object against a schema
 */
export function validateData<T = any>(data: any, schema: ValidationSchema): T {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('root', 'Data must be an object')
  }

  const validated: any = {}

  for (const [fieldName, rule] of Object.entries(schema)) {
    try {
      const value = data[fieldName]
      validated[fieldName] = validateField(value, rule, fieldName)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError(fieldName, `Unknown validation error: ${error}`)
    }
  }

  return validated as T
}

// Schema definitions for redundancy feature

export const redundancyConfigSchema: ValidationSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true
  },
  version: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+\.[0-9]+\.[0-9]+$/,
    maxLength: 20
  },
  description: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500,
    sanitize: true
  },
  featureFlag: {
    type: 'string',
    required: true,
    pattern: /^[A-Z_]+$/,
    maxLength: 50
  }
}

export const substationDataSchema: ValidationSchema = {
  id: {
    type: 'string',
    required: true,
    pattern: /^[a-zA-Z0-9-_]+$/,
    maxLength: 50
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true
  },
  status: {
    type: 'string',
    required: true,
    pattern: /^(ACTIVE|STANDBY)$/
  },
  capacity: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+MW$/,
    maxLength: 20
  },
  position: {
    type: 'object',
    required: true
  },
  color: {
    type: 'string',
    required: true,
    pattern: /^#[0-9a-fA-F]{6}$/
  },
  connections: {
    type: 'array',
    required: true
  }
}

export const lineDataSchema: ValidationSchema = {
  id: {
    type: 'string',
    required: true,
    pattern: /^[a-zA-Z0-9-_]+$/,
    maxLength: 50
  },
  from: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true
  },
  to: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: true
  },
  status: {
    type: 'string',
    required: true,
    pattern: /^(active|standby)$/
  },
  voltage: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+kV$/,
    maxLength: 20
  },
  path: {
    type: 'string',
    required: true,
    maxLength: 1000  // SVG path can be long but limit for security
  },
  color: {
    type: 'string',
    required: true,
    pattern: /^#[0-9a-fA-F]{6}$/
  },
  glowIntensity: {
    type: 'number',
    required: true
  }
}

export const redundancyStatsSchema: ValidationSchema = {
  dataCenterNeeds: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+MW$/,
    maxLength: 20
  },
  activeNow: {
    type: 'object',
    required: true
  },
  standbyReady: {
    type: 'object',
    required: true
  },
  totalCapacity: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+MW$/,
    maxLength: 20
  },
  redundancyRatio: {
    type: 'string',
    required: true,
    pattern: /^[0-9]+%$/,
    maxLength: 10
  }
}

export const eventDataSchema: ValidationSchema = {
  timestamp: {
    type: 'number',
    required: true
  },
  type: {
    type: 'string',
    required: true,
    pattern: /^redundancy:[a-zA-Z:-]+$/,
    maxLength: 100
  }
}

// Validation utility functions
export function validateRedundancyConfig(config: any) {
  return validateData(config, redundancyConfigSchema)
}

export function validateSubstationData(data: any) {
  return validateData(data, substationDataSchema)
}

export function validateLineData(data: any) {
  return validateData(data, lineDataSchema)
}

export function validateRedundancyStats(stats: any) {
  return validateData(stats, redundancyStatsSchema)
}

export function validateEventData(event: any) {
  return validateData(event, eventDataSchema)
}

// Safe data processing utilities
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError('input', 'Expected string input')
  }
  
  return stripDangerousContent(sanitizeHtml(input.trim()))
}

export function validateUrlSafety(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // Only allow HTTP(S) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // Block suspicious patterns
    if (url.includes('javascript:') || url.includes('data:') || url.includes('vbscript:')) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

export { ValidationError }