import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.redirect(
    "https://docs.google.com/spreadsheets/d/1M3u3t2TzVcJptUyfipu3IR8SExpFqIzHEeEQRoX7_-E/edit?usp=sharing",
  );
}

export const config = {
  matcher: "/:path*",
};
