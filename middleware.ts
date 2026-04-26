import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');

  const isCustomerRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/tracking') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order-success');

  const loginWithRedirect = (targetPath: string) => {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', targetPath);
    return NextResponse.redirect(url);
  };

  if (!accessToken && (isAdminRoute || isSellerRoute || isCustomerRoute)) {
    return loginWithRedirect(pathname);
  }

  if (accessToken) {
    // Protection for Admin routes
    if (isAdminRoute && userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/menu', request.url));
    }

    // Protection for Seller routes
    if (isSellerRoute && userRole !== 'seller') {
      return NextResponse.redirect(new URL('/menu', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
