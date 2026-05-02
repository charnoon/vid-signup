import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { signupSchema, type SignupResponse } from "@/lib/validation";

/** User-visible hint derived from PostgREST / Postgres errors (no secrets). */
function signupInsertErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  const m = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";

  if (
    m.includes("row-level security") ||
    code === "42501" ||
    m.includes("permission denied")
  ) {
    return "Signup blocked by database permissions. On Vercel, set SUPABASE_SERVICE_ROLE_KEY to your Supabase secret key (sb_secret_…) or legacy service_role JWT — not the publishable key — then redeploy.";
  }
  if (
    (m.includes("does not exist") || m.includes("not found")) &&
    m.includes("waitlist")
  ) {
    return "The waitlist table was not found. In Supabase SQL Editor, run the full supabase/waitlist.sql from this repo.";
  }
  if (m.includes("marketing_consent") && m.includes("column")) {
    return "Database is missing the marketing_consent column. In Supabase SQL Editor, run supabase/waitlist.sql.";
  }
  if (
    m.includes("invalid api key") ||
    m.includes("jwt") && m.includes("invalid")
  ) {
    return "Invalid Supabase API key on the server. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY where the app is hosted.";
  }
  return "Unable to save signup right now";
}

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

  const { email, marketing_consent } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error("[api/signup] Missing or invalid Supabase env", err);
    return NextResponse.json<SignupResponse>(
      {
        success: false,
        error:
          "Server is missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the host (e.g. Vercel), then redeploy.",
      },
      { status: 500 },
    );
  }

  const { error } = await supabaseAdmin.from("waitlist").insert({
    first_name: "",
    last_name: "",
    email: normalizedEmail,
    marketing_consent: marketing_consent ?? false,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json<SignupResponse>(
        { success: true, message: "Already signed up" },
        { status: 200 },
      );
    }

    console.error("[api/signup] Supabase insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return NextResponse.json<SignupResponse>(
      { success: false, error: signupInsertErrorMessage(error) },
      { status: 500 },
    );
  }

  return NextResponse.json<SignupResponse>(
    { success: true, message: "You're on the list" },
    { status: 200 },
  );
}
