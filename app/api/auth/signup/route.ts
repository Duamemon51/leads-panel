import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken, TOKEN_NAME } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  await connectDB()

  const exists = await User.findOne({ email })
  if (exists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const user = await User.create({ name, email, password })

  const token = await signToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  })

  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ success: true })
}