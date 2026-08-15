/**
 * Composable untuk admin authentication
 */
export function useAuth() {
  const isLoggedIn = useState('auth:loggedIn', () => false)
  const adminUsername = useState('auth:username', () => '')
  const { apiPost, apiGet } = useApi()

  function getToken(): string | null {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  function setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('admin_token', token)
    }
  }

  function removeToken() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  }

  async function login(username: string, password: string) {
    const res = await apiPost<{ token: string; username: string }>('/api/admin/login', {
      username,
      password,
    })
    setToken(res.token)
    isLoggedIn.value = true
    adminUsername.value = res.username
    return res
  }

  async function logout() {
    try {
      await apiPost('/api/admin/logout')
    } catch {
      // ignore
    }
    removeToken()
    isLoggedIn.value = false
    adminUsername.value = ''
  }

  async function verify() {
    const token = getToken()
    if (!token) {
      isLoggedIn.value = false
      return false
    }
    try {
      const res = await apiGet<{ valid: boolean; username: string }>('/api/admin/verify')
      isLoggedIn.value = res.valid
      adminUsername.value = res.username
      return res.valid
    } catch {
      removeToken()
      isLoggedIn.value = false
      return false
    }
  }

  return { isLoggedIn, adminUsername, login, logout, verify, getToken }
}
