import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = ["/login", "/register", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Get authentication cookies
  const userId = request.cookies.get("userId")?.value
  const role = request.cookies.get("role")?.value

  // If the user is not authenticated and trying to access a protected route
  if (!userId && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access auth pages
  if (userId && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Role-based access control could be implemented here
  // For example, if a non-admin user tries to access admin routes

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
