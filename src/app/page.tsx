"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

import styles from "./page.module.css";
import type { SignupResponse } from "@/lib/validation";

const INTRO_TEXT = " is an online platform for new music visuals.";
const LAST_SENTENCE_TEXT = " prioritises curation over algorithms.";
/** Intro first, then only this extra line alternates with intro */
const ROTATING_PHRASES = [INTRO_TEXT, LAST_SENTENCE_TEXT] as const;

const CTA_TEXT = "REQUEST EARLY ACCESS";
const REVEAL_DELAY_MS = 2000;
const TYPE_INTERVAL_MS = 45;
const DELETE_INTERVAL_MS = 26;
const PHRASE_HOLD_MS = 2800;

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const [typedCtaText, setTypedCtaText] = useState("");
  const [hasIntroCompleted, setHasIntroCompleted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const typePhrase = async (phrase: string) => {
      for (let index = 1; index <= phrase.length; index += 1) {
        if (cancelled) return;
        setTypedText(phrase.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
      }
    };

    const deletePhrase = async (phrase: string) => {
      for (let index = phrase.length - 1; index >= 0; index -= 1) {
        if (cancelled) return;
        setTypedText(phrase.slice(0, index));
        await wait(DELETE_INTERVAL_MS);
      }
    };

    const runTypewriter = async () => {
      await wait(REVEAL_DELAY_MS);
      if (cancelled) return;

      await typePhrase(INTRO_TEXT);
      if (cancelled) return;

      setHasIntroCompleted(true);
      for (let index = 1; index <= CTA_TEXT.length; index += 1) {
        if (cancelled) return;
        setTypedCtaText(CTA_TEXT.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
      }

      let phraseIndex = 0;
      let currentPhrase = ROTATING_PHRASES[phraseIndex]!;

      while (!cancelled) {
        await wait(PHRASE_HOLD_MS);
        if (cancelled) return;

        await deletePhrase(currentPhrase);
        if (cancelled) return;

        const nextIndex = (phraseIndex + 1) % ROTATING_PHRASES.length;
        currentPhrase = ROTATING_PHRASES[nextIndex]!;
        phraseIndex = nextIndex;
        await typePhrase(currentPhrase);
      }
    };

    void runTypewriter();

    return () => {
      cancelled = true;
      for (const timer of timers) {
        window.clearTimeout(timer);
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
      <div className={styles.heroBackgroundWrap}>
        <Image
          className={styles.heroBackground}
          src="/preview.png"
          alt=""
          fill
          sizes="100vw"
          priority
          draggable={false}
          aria-hidden
        />
      </div>

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
        {hasIntroCompleted ? (
          <button
            type="button"
            className={styles.inlineCta}
            onClick={() => setIsFormOpen((previous) => !previous)}
          >
            <span className={styles.inlineCtaText}>{typedCtaText}</span>
            {typedCtaText.length === CTA_TEXT.length ? (
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
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
