import { describe, expect, it } from 'vitest'
import { CvSchema, LayoutImportSchema } from '../schemas'

// ── CvSchema ──────────────────────────────────────────────────────────────────

describe('CvSchema', () => {
  it('accepts a minimal valid CV', () => {
    const result = CvSchema.safeParse({ identity: { name: 'Alice' } })
    expect(result.success).toBe(true)
  })

  it('accepts extra top-level fields (passthrough)', () => {
    const result = CvSchema.safeParse({
      identity: { name: 'Alice' },
      experience: [],
      custom_field: 'ok',
    })
    expect(result.success).toBe(true)
  })

  it('accepts extra identity fields (passthrough)', () => {
    const result = CvSchema.safeParse({
      identity: { name: 'Alice', headline: 'Engineer', contact: [] },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing identity', () => {
    const result = CvSchema.safeParse({ experience: [] })
    expect(result.success).toBe(false)
  })

  it('rejects empty identity.name', () => {
    const result = CvSchema.safeParse({ identity: { name: '' } })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('identity.name is required')
  })

  it('rejects non-object input', () => {
    expect(CvSchema.safeParse('string').success).toBe(false)
    expect(CvSchema.safeParse(null).success).toBe(false)
    expect(CvSchema.safeParse([]).success).toBe(false)
  })
})

// ── LayoutImportSchema ────────────────────────────────────────────────────────

describe('LayoutImportSchema', () => {
  const validImport = {
    header: { style: 'stacked' },
    sections: [{ id: 'work', breakable: true }],
  }

  it('accepts a minimal valid layout import', () => {
    const result = LayoutImportSchema.safeParse(validImport)
    expect(result.success).toBe(true)
  })

  it('accepts columns sections', () => {
    const result = LayoutImportSchema.safeParse({
      header: { style: 'split' },
      sections: [
        { type: 'columns', columns: 2, content: [['skills'], ['langs']], breakable: true },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts metadata fields from export (_name, _templateId)', () => {
    const result = LayoutImportSchema.safeParse({
      ...validImport,
      _name: 'My config',
      _templateId: 'default',
      _savedAt: 1234567890,
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional style field', () => {
    const result = LayoutImportSchema.safeParse({
      ...validImport,
      style: { accent: '#ff0000' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing header', () => {
    const result = LayoutImportSchema.safeParse({ sections: [] })
    expect(result.success).toBe(false)
  })

  it('rejects invalid header.style value', () => {
    const result = LayoutImportSchema.safeParse({
      header: { style: 'centered' },
      sections: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing sections', () => {
    const result = LayoutImportSchema.safeParse({ header: { style: 'stacked' } })
    expect(result.success).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(LayoutImportSchema.safeParse('string').success).toBe(false)
    expect(LayoutImportSchema.safeParse(null).success).toBe(false)
  })
})
