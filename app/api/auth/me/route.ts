import { cookies } from 'next/headers'
import { verifyToken, TOKEN_NAME } from '@/lib/jwt'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = cookies().get(TOKEN_NAME)?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: payload })
}