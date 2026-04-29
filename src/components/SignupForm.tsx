"use client";

import { FormEvent, useState } from "react";

import type { SignupResponse } from "@/lib/validation";

type FormState = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
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
          first_name: firstName,
          last_name: lastName,
          email,
          role: role || undefined,
        }),
      });

      const data = (await response.json()) as SignupResponse;

      if (!response.ok || !data.success) {
        setState("error");
        setMessage(data.success ? "Request failed" : data.error);
        return;
      }

      setState("success");
      setMessage("You're on the list");
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <input
        type="text"
        name="first_name"
        placeholder="First name"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        minLength={2}
        required
      />

      <input
        type="text"
        name="last_name"
        placeholder="Last name"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        minLength={2}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <select
        name="role"
        value={role}
        onChange={(event) => setRole(event.target.value)}
        aria-label="Role"
      >
        <option value="">Select your role (optional)</option>
        <option value="founder">Founder</option>
        <option value="developer">Developer</option>
        <option value="designer">Designer</option>
        <option value="marketer">Marketer</option>
        <option value="other">Other</option>
      </select>

      <button type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Submitting..." : "Join waitlist"}
      </button>

      {state === "success" ? <p>{message}</p> : null}
      {state === "error" ? <p>{message}</p> : null}
    </form>
  );
}
