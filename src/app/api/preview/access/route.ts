import { NextResponse } from "next/server";

import {
  createIntroAccessToken,
  INTRO_ACCESS_COOKIE,
  isIntroAccessConfigured,
  isIntroPasswordValid,
} from "@/lib/intro-access";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const MAX_ATTEMPTS_PER_WINDOW = 10;
const WINDOW_MS = 60_000;
const ipRateLimitStore = new Map<string, RateLimitEntry>();

function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = ipRateLimitStore.get(ip);

  if (!current || now > current.resetAt) {
    ipRateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }

  current.count += 1;
  ipRateLimitStore.set(ip, current);
  return false;
}

export async function POST(request: Request) {
  if (!isIntroAccessConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Preview access is not configured." },
      { status: 503 },
    );
  }

  const ip = getRequestIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again shortly." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!isIntroPasswordValid(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(INTRO_ACCESS_COOKIE, createIntroAccessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
