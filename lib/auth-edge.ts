import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
    userId: string;
    email: string;
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as TokenPayload;
    } catch (error) {
        throw new Error('Token expired or invalid');
    }
}
