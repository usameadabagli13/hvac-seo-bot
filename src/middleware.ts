import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static assets, the public demo-keywords API,
    // and the OAuth callback route (callback handles its own session exchange
    // and must not be intercepted by the session-refresh middleware).
    "/((?!_next/static|_next/image|favicon\\.ico|api/demo-keywords|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
