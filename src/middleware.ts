import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Hard bypass for all /auth/* routes so the OAuth callback page always
  // renders uninterrupted, regardless of regex-matcher edge cases.
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static assets, the public demo-keywords API,
    // and all /auth/ routes (OAuth callback must never be intercepted).
    "/((?!_next/static|_next/image|favicon\\.ico|api/demo-keywords|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
