import { type NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/dashboard"];
const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivateRoute = privateRoutes.includes(pathname);

  if (isPrivateRoute) {
    // Check for authentication cookie
    const authCookie = request.cookies.get("access_token");
    if (!authCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      return NextResponse.redirect(redirectUrl);
    }
  } else if (pathname === "/login") {
    // Check for authentication cookie
    const authCookie = request.cookies.get("access_token");
    if (authCookie) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
