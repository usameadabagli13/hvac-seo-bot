import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals, static assets, and the
    // public demo-keywords API (which is intentionally unauthenticated).
    "/((?!_next/static|_next/image|favicon\\.ico|api/demo-keywords|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
