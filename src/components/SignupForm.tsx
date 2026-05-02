"use client";

import { FormEvent, useState } from "react";

import type { SignupResponse } from "@/lib/validation";

type FormState = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketing_consent: marketingConsent,
        }),
      });

      const data = (await response.json()) as SignupResponse;

      if (!response.ok || !data.success) {
        setState("error");
        setMessage(data.success ? "Request failed" : data.error);
        return;
      }

      setState("success");
      setMessage("You're In");
      setEmail("");
      setMarketingConsent(false);
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
        />
        Receive platform updates and new releases
      </label>

      <button type="submit" disabled={state === "loading"} aria-busy={state === "loading"}>
        {state === "loading" ? "Submitting…" : "Join waitlist"}
      </button>

      {state === "success" ? (
        <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 16 }}>
          {message}
        </p>
      ) : null}
      {state === "error" ? (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: "#b42318" }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
