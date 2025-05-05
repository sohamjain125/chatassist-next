import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Verify the token
  let isAuthenticated = false
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      )
      await jwtVerify(token, secret)
      isAuthenticated = true
    } catch (error) {
      isAuthenticated = false
    }
  }

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is authenticated and tries to access login/register, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user is not authenticated and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 