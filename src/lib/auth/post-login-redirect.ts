const CUSTOMER_HOME = '/';

/** Customer paths that should not be used as post-login destination (account hub, legacy hop). */
const CUSTOMER_POST_LOGIN_SKIP = new Set(['/profile', '/orders', '/menu']);

export function resolvePostLoginRedirect(
  redirectPath: string | null | undefined,
  role: string,
): string {
  const safe =
    redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
      ? redirectPath
      : undefined;

  if (role === 'admin' || role === 'superadmin') {
    return safe ?? '/admin/dashboard';
  }
  if (role === 'seller') {
    return safe ?? '/seller/dashboard';
  }

  if (safe && !CUSTOMER_POST_LOGIN_SKIP.has(safe)) {
    return safe;
  }
  return CUSTOMER_HOME;
}

/** When sending unauthenticated users to login, avoid returning them to account-only pages. */
export function loginRedirectParam(pathname: string): string {
  if (
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/')
  ) {
    return CUSTOMER_HOME;
  }
  return pathname;
}
