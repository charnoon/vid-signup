import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
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
      { success: false, error: "Too many requests. Please try again soon." },
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
    return NextResponse.json<SignupResponse>(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const { first_name, last_name, email, role, interest } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("waitlist").insert({
    first_name,
    last_name,
    email: normalizedEmail,
    role: role || null,
    interest: interest || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json<SignupResponse>(
        { success: true, message: "Already signed up" },
        { status: 200 },
      );
    }

    return NextResponse.json<SignupResponse>(
      { success: false, error: "Unable to save signup right now" },
      { status: 500 },
    );
  }

  // Placeholder: trigger transactional/welcome email integration (Resend, etc.).

  return NextResponse.json<SignupResponse>(
    { success: true, message: "You're on the list" },
    { status: 200 },
  );
}
