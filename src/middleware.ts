import { NextRequest, NextResponse } from "next/server";

const PREVIEW_HOST = "preview.vid.global";

function isHiddenPreviewPath(pathname: string) {
  return (
    pathname === "/preview" ||
    pathname === "/preview/" ||
    pathname === "/preview/landing" ||
    pathname === "/preview/landing/"
  );
}

function isLocalHost(host: string | undefined) {
  return host === "localhost" || host === "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  const { pathname } = request.nextUrl;
  const onPreviewHost = host === PREVIEW_HOST;

  if (onPreviewHost && pathname === "/") {
    return NextResponse.rewrite(new URL("/preview/landing", request.url));
  }

  if (isHiddenPreviewPath(pathname)) {
    if (onPreviewHost) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isLocalHost(host)) {
      return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
