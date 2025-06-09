import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// This function is executed for every request
export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
