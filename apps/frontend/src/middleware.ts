import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    
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
    return response;
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
