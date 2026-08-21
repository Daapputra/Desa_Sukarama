/**
 * Format angka ke format Rupiah — sama persis dengan existing
 */
export function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID')
}

/**
 * Format tanggal ke format Indonesia — sama persis dengan existing
 */
export function formatTanggal(dateStr: string): string {
  // Tanggal date-only ('YYYY-MM-DD') diparse manual sebagai tanggal lokal —
  // `new Date(dateStr)` membacanya sebagai UTC-midnight, yang bisa mundur
  // satu hari di timezone di belakang UTC.
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  const d = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Potong teks panjang — sama persis dengan existing
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m)
}

/**
 * Generate badge color class berdasarkan status surat
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Diajukan':
      return 'bg-amber-100 text-amber-800'
    case 'Diproses':
      return 'bg-blue-100 text-blue-800'
    case 'Selesai':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
