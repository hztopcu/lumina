import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SYNC_COOKIE_NAME } from "@/lib/sync/constants";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();

  if (!request.cookies.get(SYNC_COOKIE_NAME)?.value) {
    const id = crypto.randomUUID();
    res.cookies.set(SYNC_COOKIE_NAME, id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }

  const p = request.nextUrl.pathname;
  if (p.startsWith("/api/sync/")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Vary", "Accept-Encoding");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
