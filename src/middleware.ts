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
      // If the path starts with /api or /auth, we should leave it alone
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) return NextResponse.next();
      
      if (url.pathname.startsWith('/app_site')) return NextResponse.next();
      return NextResponse.rewrite(new URL(`/app_site${path}`, req.url));
    }
  
    // 2. Admin Subdomain (admin.*)
    if (hostname.startsWith('admin.')) {
      // If the path starts with /api or /auth, let it fall through to the handler
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) return NextResponse.next();

      // Re-writing to internal admin path
      if (url.pathname.startsWith('/admin_site')) return NextResponse.next();
      return NextResponse.rewrite(new URL(`/admin_site${path}`, req.url));
    }
  
    // 3. API Routes - internally they can be in app_site/api or root api
    if (url.pathname.startsWith('/api')) {
        return NextResponse.next();
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
