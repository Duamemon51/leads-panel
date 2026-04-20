import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken, TOKEN_NAME } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  await connectDB()

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await user.comparePassword(password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

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

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  })
}