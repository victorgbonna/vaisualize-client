import { NextRequest, NextResponse } from "next/server";

export function middleware(req) {
  const hostname = req.headers.get("host") || "";
  const pathname = req.nextUrl.pathname;

  const isAppSubdomain = hostname.startsWith("analysis.");

  if (isAppSubdomain) {
    const url = req.nextUrl.clone();
    url.pathname = `/analysis${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
