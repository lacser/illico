import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Check if the request is for the chat page
  if (request.nextUrl.pathname.startsWith('/chat')) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/chat/:path*',
};
