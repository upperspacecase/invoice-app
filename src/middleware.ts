import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/session";

export const config = {
  matcher: ["/app/:path*"],
};

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
