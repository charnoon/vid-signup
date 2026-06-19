"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./intro.module.css";

export function IntroAccessGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/preview/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Incorrect password.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to verify password right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.accessStage}>
      <form className={styles.accessForm} onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.accessPill}>
          <label className={styles.accessLabel} htmlFor="intro-access-password">
            Password
          </label>
          <input
            id="intro-access-password"
            className={styles.accessInput}
            type="password"
            name="preview-access-code"
            placeholder="Password"
            autoComplete="off"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            data-1p-ignore
            data-lpignore="true"
          />
          <button
            type="submit"
            className={styles.accessSubmit}
            disabled={isSubmitting || password.length === 0}
          >
            <span className={styles.accessSubmitLabel}>
              {isSubmitting ? "Checking" : "Enter"}
            </span>
          </button>
        </div>
        {error ? (
          <p className={styles.accessError} role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
