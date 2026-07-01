import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

const PROTECTED = ['/dashboard', '/deposit', '/withdraw', '/reserves', '/history'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('fragmentfi_session')?.value;
  if (!token) {
    console.log(`[proxy] No session cookie — redirecting from ${pathname} to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (e) {
    console.log(`[proxy] Invalid/expired token — redirecting from ${pathname} to /`);
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.delete('fragmentfi_session');
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deposit/:path*',
    '/withdraw/:path*',
    '/reserves/:path*',
    '/history/:path*',
  ],
};
