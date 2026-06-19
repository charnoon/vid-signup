export const INTRO_ACCESS_COOKIE = "intro_access";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export function getIntroAccessPassword(): string | undefined {
  return process.env.INTRO_ACCESS_PASSWORD;
}

function getIntroAccessSecret(): string | undefined {
  return process.env.INTRO_ACCESS_SECRET ?? process.env.INTRO_ACCESS_PASSWORD;
}

export function isIntroAccessConfigured(): boolean {
  return Boolean(getIntroAccessPassword() && getIntroAccessSecret());
}

export function createIntroAccessToken(): string {
  const secret = getIntroAccessSecret();
  if (!secret) {
    throw new Error(
      "Intro access is not configured. Set INTRO_ACCESS_PASSWORD (and optionally INTRO_ACCESS_SECRET).",
    );
  }

  return secret;
}

export function verifyIntroAccessToken(token: string | undefined): boolean {
  if (!token || !isIntroAccessConfigured()) {
    return false;
  }

  const expected = getIntroAccessSecret();
  if (!expected) {
    return false;
  }

  return safeEqual(token, expected);
}

export function isIntroPasswordValid(password: string): boolean {
  const expected = getIntroAccessPassword();
  if (!expected) {
    return false;
  }

  return safeEqual(password, expected);
}
