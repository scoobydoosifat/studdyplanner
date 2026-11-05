import { describe, expect, it } from 'vitest'
import { ACCENTS, accentFor } from './palette'

describe('subject accents', () => {
  it('always returns one of the palette accents', () => {
    ;['English', 'Bangla', 'General Knowledge', '', null, undefined].forEach(subject => {
      expect(ACCENTS).toContain(accentFor(subject))
    })
  })

  it('is stable for the same subject', () => {
    expect(accentFor('General Knowledge')).toBe(accentFor('General Knowledge'))
    expect(accentFor('Bangla')).toBe(accentFor('Bangla'))
  })

  it('spreads different subjects across the palette', () => {
    const used = new Set(['English', 'Bangla', 'General Knowledge'].map(accentFor))
    expect(used.size).toBeGreaterThan(1)
  })
})
