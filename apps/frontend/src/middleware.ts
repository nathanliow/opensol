import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function is executed for every request
export async function middleware(request: NextRequest) {
  // Temporarily disabled middleware to debug 404 issues
  return NextResponse.next();
  
  /*
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for public routes and API routes
  if (
    pathname === '/' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Skip for static files
  ) {
    return NextResponse.next();
  }

  try {    
    // Create response object
    const response = NextResponse.next();
    
    // Get auth cookie if it exists
    const authCookie = request.cookies.get('sb-access-token');
    
    // If no auth cookie, redirect to home
    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('redirectUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed
    return NextResponse.next();
  }
  */
}

// Only run middleware on specific protected paths
export const config = {
  matcher: [
    /*
     * Match specific protected paths only
     */
    '/dashboard/:path*',
    '/profile/:path*',
    '/project/:path*',
  ],
};
