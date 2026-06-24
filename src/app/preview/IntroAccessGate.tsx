"use client";

import { FormEvent, useRef, useState } from "react";

import styles from "./intro.module.css";

type IntroAccessGateProps = {
  onEnterPress?: () => void;
  onAccessGranted?: () => void;
  onAccessDenied?: () => void;
};

export function IntroAccessGate({
  onEnterPress,
  onAccessGranted,
  onAccessDenied,
}: IntroAccessGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const playTriggeredRef = useRef(false);

  function triggerPlayFromGesture() {
    if (playTriggeredRef.current || isSubmitting || password.length === 0) return;

    playTriggeredRef.current = true;
    onEnterPress?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || password.length === 0) return;

    triggerPlayFromGesture();

    setIsSubmitting(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/preview/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !data.ok) {
          onAccessDenied?.();
          setError(data.error ?? "Incorrect password.");
          return;
        }

        onAccessGranted?.();
      } catch {
        onAccessDenied?.();
        setError("Unable to verify password right now.");
      } finally {
        setIsSubmitting(false);
        playTriggeredRef.current = false;
      }
    })();
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
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

              triggerPlayFromGesture();
            }}
            disabled={isSubmitting}
            data-1p-ignore
            data-lpignore="true"
          />
          <button
            type="submit"
            className={styles.accessSubmit}
            disabled={isSubmitting || password.length === 0}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;

              triggerPlayFromGesture();
            }}
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
