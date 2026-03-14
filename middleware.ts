import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/zones') ||
    pathname.startsWith('/menu-management') ||
    pathname.startsWith('/orders-management');

  const isCustomerRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/tracking') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout');

  if (!accessToken && (isAdminRoute || isCustomerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (accessToken) {
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/menu', request.url));
    }
    if (isCustomerRoute && userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
