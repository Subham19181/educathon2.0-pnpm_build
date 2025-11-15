import { type NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/product', '/product/study', '/product/test', '/product/analytics']

// Routes that should redirect to /product if user is already authenticated
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  // Note: We cannot directly access auth state in middleware (client-side only)
  // Instead, we rely on client-side redirects via AuthInitializer
  // This middleware is a placeholder for future server-side auth checks if needed

  // For now, simply allow all requests to proceed
  // Client-side components (AuthInitializer) will handle redirects based on auth state
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
