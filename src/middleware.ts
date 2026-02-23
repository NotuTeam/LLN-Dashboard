/** @format */

import { NextResponse, NextRequest } from "next/server";
import { LocalToken, ValidPath } from "./lib/var";
import { lastPathname } from "./lib/utils";

export default async function middleware(req: NextRequest) {
  const path = lastPathname(req.url);
  const token = req.cookies.get(LocalToken);

  if (!token && ValidPath.includes(path)) {
    const loginURL = new URL("/login", req.url);
    return NextResponse.redirect(loginURL);
  }

  if (token && path === "/login") {
    const homeURL = new URL("/", req.url);
    return NextResponse.redirect(homeURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
