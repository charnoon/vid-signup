import { createSign } from "crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const APPEND_RANGE = "Sheet1!A:C";

type GoogleSheetsConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  sheetId: string;
};

function base64UrlEncode(value: string | Buffer): string {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer.toString("base64url");
}

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, "\n");
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    throw new Error(
      "Missing Google Sheets configuration. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID.",
    );
  }

  return {
    serviceAccountEmail,
    privateKey: normalizePrivateKey(privateKey),
    sheetId,
  };
}

function createServiceAccountJwt(
  serviceAccountEmail: string,
  privateKey: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const signatureInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");
  return `${signatureInput}.${signature}`;
}

async function getAccessToken(config: GoogleSheetsConfig): Promise<string> {
  const assertion = createServiceAccountJwt(
    config.serviceAccountEmail,
    config.privateKey,
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "Failed to obtain Google access token");
  }

  return data.access_token;
}

export async function appendSignupRow({
  email,
  source,
  createdAt,
}: {
  email: string;
  source: string;
  createdAt: string;
}): Promise<void> {
  const config = getGoogleSheetsConfig();
  const accessToken = await getAccessToken(config);
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${encodeURIComponent(APPEND_RANGE)}:append`,
  );
  url.searchParams.set("valueInputOption", "USER_ENTERED");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [[email, source, createdAt]],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Google Sheets append failed (${response.status}): ${errorBody}`,
    );
  }
}
