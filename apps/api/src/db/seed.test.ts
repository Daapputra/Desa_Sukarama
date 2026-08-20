import { describe, it, expect } from 'vitest'
import { seedPengumumanData } from './seed.js'

// Regression test for a bug where seed strings contained the literal
// 2-character sequence `\n` (backslash + "n") instead of a real newline,
// which rendered as raw "\n\n" text on the public homepage.
describe('seedPengumumanData', () => {
  it('does not contain a literal backslash-n escape sequence', () => {
    for (const item of seedPengumumanData) {
      expect(item.konten).not.toMatch(/\\n/)
    }
  })

  it('uses real newlines to separate paragraphs', () => {
    for (const item of seedPengumumanData) {
      expect(item.konten).toContain('\n')
    }
  })
})
