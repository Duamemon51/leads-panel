import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TOKEN_NAME } from '@/lib/jwt'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value

  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup')

  if (isAuthPage) return NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const valid = await verifyToken(token)

  if (!valid) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*'],
}