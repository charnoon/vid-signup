"use client";

import { FormEvent, useEffect, useState } from "react";

import styles from "./page.module.css";
import type { SignupResponse } from "@/lib/validation";

const FULL_TEXT = " is an online platform for new music visuals.";
const CTA_TEXT = "REQUEST EARLY ACCESS";
const REVEAL_DELAY_MS = 2000;
const TYPE_INTERVAL_MS = 45;

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const [typedCtaText, setTypedCtaText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let typeInterval: number | null = null;
    let ctaInterval: number | null = null;
    const startTimeout = window.setTimeout(() => {
      let index = 0;
      typeInterval = window.setInterval(() => {
        index += 1;
        setTypedText(FULL_TEXT.slice(0, index));

        if (index >= FULL_TEXT.length) {
          if (typeInterval) {
            window.clearInterval(typeInterval);
          }

          let ctaIndex = 0;
          ctaInterval = window.setInterval(() => {
            ctaIndex += 1;
            setTypedCtaText(CTA_TEXT.slice(0, ctaIndex));

            if (ctaIndex >= CTA_TEXT.length && ctaInterval) {
              window.clearInterval(ctaInterval);
            }
          }, TYPE_INTERVAL_MS);
        }
      }, TYPE_INTERVAL_MS);
    }, REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(startTimeout);
      if (typeInterval) {
        window.clearInterval(typeInterval);
      }
      if (ctaInterval) {
        window.clearInterval(ctaInterval);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormMessage(null);

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
        setFormError(data.success ? "Signup failed." : data.error);
        return;
      }

      setFormMessage(data.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.landing}>
      <video
        className={styles.video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/landing-loop.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      <div className={styles.headlineBlock}>
        <h1 className={styles.headline}>
          <span>Vid</span>
          <span className={styles.blinkingDot}>.</span>
          <span className={styles.typed}>{typedText}</span>
        </h1>
      </div>

      <div className={styles.ctaBlock}>
        <div className={styles.ctaInner}>
        {typedText.length === FULL_TEXT.length ? (
          <button
            type="button"
            className={styles.inlineCta}
            onClick={() => setIsFormOpen((previous) => !previous)}
          >
            <span>{typedCtaText}</span>
            {typedCtaText.length === CTA_TEXT.length ? (
              <span aria-hidden="true">→</span>
            ) : null}
          </button>
        ) : null}

        <form
          className={`${styles.signupForm} ${isFormOpen ? styles.signupFormOpen : ""}`}
          onSubmit={handleSubmit}
        >
          <div className={`${styles.field} ${styles.fieldShort}`}>
            <input
              type="text"
              name="first_name"
              aria-label="First name"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              minLength={2}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.fieldShort}`}>
            <input
              type="text"
              name="last_name"
              aria-label="Last name"
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              minLength={2}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.fieldLong}`}>
            <input
              type="email"
              name="email"
              aria-label="Email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.fieldLong}`}>
            <select
              className={role ? styles.selectFilled : styles.selectPlaceholder}
              name="role"
              aria-label="Practice"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">Practice</option>
              <option value="artist">Artist</option>
              <option value="director">Director</option>
              <option value="producer">Producer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            className={`${styles.submitButton} ${styles.submitButtonFull}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </form>

        {isFormOpen && formMessage ? <p className={styles.formStatus}>{formMessage}</p> : null}
        {isFormOpen && formError ? <p className={styles.formStatus}>{formError}</p> : null}
        </div>
      </div>
    </main>
  );
}
