import crypto from 'node:crypto'

// In-memory token store: token → { username, createdAt }
const authTokens = new Map<string, { username: string; createdAt: number }>()

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function setToken(token: string, username: string) {
  authTokens.set(token, { username, createdAt: Date.now() })
}

export function getToken(token: string): { username: string; createdAt: number } | undefined {
  return authTokens.get(token)
}

export function deleteToken(token: string) {
  authTokens.delete(token)
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}
