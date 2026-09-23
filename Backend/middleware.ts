import { NextResponse } from 'next/server'

export function middleware(req: Request) {
  const url = new URL(req.url)
  const isProtected = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/profile-setup')
  if (!isProtected) return NextResponse.next()
  const cookie = (req.headers as any).get('cookie') || ''
  if (!/pathwise_session=([^;]+)/.test(cookie)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile-setup/:path*']
}

