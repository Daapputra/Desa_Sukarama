import crypto from 'node:crypto';
// In-memory token store: token → { username, createdAt }
const authTokens = new Map();
export function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}
export function setToken(token, username) {
    authTokens.set(token, { username, createdAt: Date.now() });
}
export function getToken(token) {
    return authTokens.get(token);
}
export function deleteToken(token) {
    authTokens.delete(token);
}
export function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}
//# sourceMappingURL=auth.js.map