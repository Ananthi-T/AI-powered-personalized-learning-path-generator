import { NextResponse } from 'next/server'

export function middleware(req: Request) {
  const url = new URL((req as any).url)
  const path = url.pathname
  const isProtected =
    path.startsWith('/dashboard') ||
    path.startsWith('/profile-setup') ||
    path.startsWith('/ai-snapshot') ||
    path.startsWith('/app')
  if (!isProtected) return NextResponse.next()
  const cookie = (req as any).headers.get('cookie') || ''
  if (!/pathwise_session=([^;]+)/.test(cookie)) {
    return NextResponse.redirect(new URL('/login', (req as any).url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile-setup/:path*', '/ai-snapshot/:path*', '/app/:path*']
}
