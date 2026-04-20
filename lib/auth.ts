import { cookies } from 'next/headers'
import { verifyToken, TOKEN_NAME, AuthPayload } from '@/lib/jwt'

export async function getAuthUser(): Promise<AuthPayload | null> {
  try {
    const token = cookies().get(TOKEN_NAME)?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}