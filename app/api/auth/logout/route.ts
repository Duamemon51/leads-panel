import { cookies } from 'next/headers'
import { TOKEN_NAME } from '@/lib/jwt'
import { ok } from '@/lib/response'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
  return ok({ message: 'Logged out successfully' })
}
