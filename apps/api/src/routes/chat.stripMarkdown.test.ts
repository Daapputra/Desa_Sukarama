import { describe, it, expect } from 'vitest'
import { stripMarkdown, hasRepetitionLoop } from './chat.js'

describe('stripMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripMarkdown('Untuk **Surat Domisili**, silakan...')).toBe('Untuk Surat Domisili, silakan...')
  })

  it('removes heading markers', () => {
    expect(stripMarkdown('## Langkah-langkah\nBuka halaman')).toBe('Langkah-langkah\nBuka halaman')
  })

  it('removes bullet markers but keeps the text', () => {
    expect(stripMarkdown('- Buka halaman Layanan\n- Pilih jenis surat'))
      .toBe('Buka halaman Layanan\nPilih jenis surat')
  })

  it('leaves plain text untouched', () => {
    expect(stripMarkdown('Jam pelayanan Senin-Jumat 08.00-15.00 WIB.'))
      .toBe('Jam pelayanan Senin-Jumat 08.00-15.00 WIB.')
  })
})

describe('hasRepetitionLoop', () => {
  it('detects a word repeated many times in a row', () => {
    expect(hasRepetitionLoop('Isi formulir Giorgio Giorgio Giorgio Giorgio Giorgio Giorgio Giorgio.')).toBe(true)
  })

  it('does not flag normal Indonesian text', () => {
    expect(hasRepetitionLoop('Buka halaman Layanan, pilih jenis surat, lalu isi data diri Anda.')).toBe(false)
  })

  it('does not flag short, natural repeated words', () => {
    expect(hasRepetitionLoop('Terima kasih, terima kasih banyak atas bantuannya.')).toBe(false)
  })
})
