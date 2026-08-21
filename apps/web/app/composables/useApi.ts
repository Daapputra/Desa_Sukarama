/**
 * Composable untuk API calls ke Fastify backend
 */
export function useApi() {
  const config = useRuntimeConfig()
  // Di SSR (jalan di dalam container Docker), apiBase publik biasanya
  // menunjuk ke URL yang browser bisa akses (mis. localhost:3005 lewat port
  // mapping host) — itu tidak reachable dari container 'web' sendiri.
  // apiBaseInternal (server-only) menunjuk ke nama service Docker sehingga
  // fetch SSR jalan; di client selalu pakai apiBase publik.
  const apiBase = (import.meta.server && config.apiBaseInternal)
    ? (config.apiBaseInternal as string)
    : (config.public.apiBase as string)

  function getAuthHeaders(): Record<string, string> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async function apiFetch<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${apiBase}${path}`
    let res: Response
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
      })
    } catch (err: any) {
      // Tangkap error jaringan (seperti "Failed to fetch")
      throw new Error('Gagal terhubung ke server. Pastikan koneksi internet aktif atau server sedang berjalan.')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    return res.json()
  }

  async function apiGet<T = any>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'GET' })
  }

  async function apiPost<T = any>(path: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData
    return apiFetch<T>(path, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    })
  }

  async function apiPut<T = any>(path: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData
    return apiFetch<T>(path, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    })
  }

  async function apiDelete<T = any>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'DELETE' })
  }

  return { apiFetch, apiGet, apiPost, apiPut, apiDelete }
}
