import { describe, expect, it } from 'vitest'
import { ACCENTS, accentFor } from './palette'

describe('subject accents', () => {
  it('always returns one of the palette accents', () => {
    ;['Mathematics', 'English', 'Physics', '', null, undefined, 'ICT'].forEach(subject => {
      expect(ACCENTS).toContain(accentFor(subject))
    })
  })

  it('is stable for the same subject', () => {
    expect(accentFor('Chemistry')).toBe(accentFor('Chemistry'))
    expect(accentFor('Bangla')).toBe(accentFor('Bangla'))
  })

  it('spreads different subjects across the palette', () => {
    const used = new Set(['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Bangla'].map(accentFor))
    expect(used.size).toBeGreaterThan(1)
  })
})
