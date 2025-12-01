import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { paths } from "./app/(common)/lib/paths";

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  paths.dashboard,
  paths.accounting.root,
  paths.sales.invoices,
  paths.sales.customers,
  paths.expenses.bills,
  paths.expenses.vendors,
  paths.settings.users,
];

/**
 * Public routes that should redirect authenticated users away
 */
const publicOnlyRoutes = [paths.auth.login, paths.auth.register];

/**
 * Middleware to handle authentication and route protection
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create Supabase client for middleware
  const response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response.cookies.setAll(cookiesToSet);
        },
      },
    },
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Check if current route is public only
  const isPublicOnlyRoute = publicOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(paths.auth.login, request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isPublicOnlyRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    if (redirectTo && !publicOnlyRoutes.includes(redirectTo as any)) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL(paths.dashboard.root, request.url));
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes that handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
