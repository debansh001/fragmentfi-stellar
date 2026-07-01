import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('fragmentfi_session')?.value;

  const isAuthPage = request.nextUrl.pathname === '/'; // Assuming root is the login/landing page
  const protectedRoutes = ['/dashboard', '/deposit', '/withdraw', '/reserves', '/history'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) || request.nextUrl.pathname.startsWith('/app')
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (e) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('fragmentfi_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deposit/:path*',
    '/withdraw/:path*',
    '/reserves/:path*',
    '/history/:path*',
    '/app/:path*'
  ]
};
