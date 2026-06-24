import { NextResponse } from "next/server";

import { appendSignupRow } from "@/lib/google-sheets";
import { signupSchema, type SignupResponse } from "@/lib/validation";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const MAX_REQUESTS_PER_WINDOW = 8;
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

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  current.count += 1;
  ipRateLimitStore.set(ip, current);
  return false;
}

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json<SignupResponse>(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<SignupResponse>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return NextResponse.json<SignupResponse>(
      {
        success: false,
        error:
          fieldErrors.email?.[0] ??
          fieldErrors.marketing_consent?.[0] ??
          "Invalid input.",
      },
      { status: 400 },
    );
  }

  try {
    await appendSignupRow({
      email: parsed.data.email,
      source: "vid-signup-page",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/signup] Google Sheets append failed", error);
    return NextResponse.json<SignupResponse>(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json<SignupResponse>({
    success: true,
    message: "Thanks for signing up to Vid.",
  });
}
