import { NextResponse, type NextRequest } from "next/server";

import {
  INTRO_ACCESS_COOKIE,
  isIntroAccessConfigured,
  verifyIntroAccessToken,
} from "@/lib/intro-access";

export function middleware(request: NextRequest) {
  if (!isIntroAccessConfigured()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(INTRO_ACCESS_COOKIE)?.value;

  if (verifyIntroAccessToken(token)) {
    return NextResponse.next();
  }

  return new NextResponse("Unauthorized", { status: 401 });
}

export const config = {
  matcher: ["/assets/intro/:path*"],
};
