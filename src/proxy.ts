import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. Next.js internals (_next)
     * 2. Static assets (static)
     * 3. Static files in public (e.g. .png, .jpg, .svg, .ico, etc.)
     */
    '/((?!_next/|static/|api/|_static/|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Get the relative path
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
  
  const res = (() => {
    // 1. App Subdomain (app.*)
    if (hostname.startsWith('app.')) {
      const isLoggedIn = req.cookies.has('hubby_liff_logged_in');
      const isBypass = req.cookies.get('hubby_bypass')?.value === '1';
      
      // If not logged in and no bypass, redirect to landing
      if (!isLoggedIn && !isBypass && !url.pathname.startsWith('/api')) {
         return NextResponse.redirect(new URL('/', req.url));
      }

      if (url.pathname.startsWith('/app_site')) return NextResponse.next();
      return NextResponse.rewrite(new URL(`/app_site${path}`, req.url));
    }
  
    // 2. Admin Subdomain (admin.*)
    if (hostname.startsWith('admin.')) {
      const hasSession = req.cookies.has('sb-access-token') || req.cookies.has('supabase-auth-token');
      const isLoginPath = url.pathname.includes('/login');

      // If not logged in and not on login page, let the layout handle redirect OR handle it here
      // Re-writing first so the internal paths work
      if (url.pathname.startsWith('/admin_site')) return NextResponse.next();
      return NextResponse.rewrite(new URL(`/admin_site${path}`, req.url));
    }
  
    // 3. API Routes - internally they are in app_site/api
    if (url.pathname.startsWith('/api')) {
        if (url.pathname.startsWith('/app_site/api')) return NextResponse.next();
        return NextResponse.rewrite(new URL(`/app_site${path}`, req.url));
    }

    // Webhook / server routes under /app_site/api must not be rewritten to landing
    if (url.pathname.startsWith('/app_site/api')) {
      return NextResponse.next();
    }
  
    // 4. Default / Root Domain (Landing Page)
    if (url.pathname.startsWith('/landing_site')) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/landing_site${path}`, req.url));
  })();

  // Handle bypass cookie
  if (url.searchParams.get('liff-bypass') === '1') {
    res.cookies.set('hubby_bypass', '1', {
       path: '/',
       maxAge: 30 * 24 * 60 * 60, // 30 days
       httpOnly: false, // Must be accessible for client side LiffProvider as well
    });
  }

  return res;
}
