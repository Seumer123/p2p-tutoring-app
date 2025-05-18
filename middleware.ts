import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow Socket.IO connections
  if (request.nextUrl.pathname.startsWith('/api/chat/socketio')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/chat/socketio/:path*',
  ],
}; 