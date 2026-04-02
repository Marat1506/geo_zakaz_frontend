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
    pathname.startsWith('/checkout');

  if (!accessToken && (isAdminRoute || isSellerRoute || isCustomerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (accessToken) {
    // If logged in as admin/superadmin, don't allow customer routes (redirect to admin dashboard)
    if (isCustomerRoute && (userRole === 'admin' || userRole === 'superadmin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // If logged in as seller, don't allow customer routes (redirect to seller dashboard)
    if (isCustomerRoute && userRole === 'seller') {
      return NextResponse.redirect(new URL('/seller/dashboard', request.url));
    }

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
