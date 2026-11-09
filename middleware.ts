import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The /admin segment layout protects all of its children, which would also
// redirect unauthenticated visitors away from /admin/login. Rewrite the login
// URL to a page outside that protected layout while keeping the public URL.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.rewrite(new URL("/admin-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login"],
};
