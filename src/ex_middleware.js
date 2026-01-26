import { NextRequest, NextResponse } from "next/server";

export function middleware(req) {
   const host = req.headers.get("host") || "";
  const pathname = req.nextUrl.pathname;
  console.log("APP PAGE host:",host);

  if (!host.startsWith("app.")) {
    return NextResponse.next();
  }

  console.log("APP PAGE PATH:", pathname);
  const url = req.nextUrl.clone();
  url.pathname = `/app${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };