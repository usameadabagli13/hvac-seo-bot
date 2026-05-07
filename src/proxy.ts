import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/demo-keywords|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
