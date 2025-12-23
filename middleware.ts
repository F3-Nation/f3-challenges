import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.redirect("https://forms.gle/tKCPRXHazWBryjyo8");
}

export const config = {
  matcher: "/:path*",
};
