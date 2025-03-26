import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// This function is executed for every request
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for public routes and API routes
  if (
    pathname === '/' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip for static files
  ) {
    return NextResponse.next();
  }

  // Get the cookies
  const cookieStore = await cookies();
  
  try {
    // Create a Supabase client using route handler
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if the user has a session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session exists, redirect to home page for authentication
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('redirectUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // If session exists, continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);
    // On error, allow the request to proceed to avoid blocking legitimate requests
    // The page component can handle authentication checks as well
    return NextResponse.next();
  }
}

// Only run middleware on the specified paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
