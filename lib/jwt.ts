import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export const TOKEN_NAME = 'lp_token'

// ✅ your real app payload type
export interface AuthPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
  name: string
}

// ✅ SIGN TOKEN (fixed typing issue)
export async function signToken(payload: AuthPayload) {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

// ✅ VERIFY TOKEN (safe + correct)
export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)

    return payload as unknown as AuthPayload
  } catch {
    return null
  }
}