export declare function generateToken(): string;
export declare function setToken(token: string, username: string): void;
export declare function getToken(token: string): {
    username: string;
    createdAt: number;
} | undefined;
export declare function deleteToken(token: string): void;
export declare function hashPassword(password: string, salt: string): string;
