"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import { BouncingLogo } from "@/components/BouncingLogo";
import styles from "@/app/page.module.css";
import type { HomeCopy } from "@/lib/home-copy-defaults";
import { signupSchema, type SignupResponse } from "@/lib/validation";

const REVEAL_DELAY_MS = 2000;
const TYPE_INTERVAL_MS = 45;
const DELETE_INTERVAL_MS = 26;
const PHRASE_HOLD_MS = 2800;

export function HomePageClient({
  introText,
  lastSentenceText,
  ctaText,
}: HomeCopy) {
  const rotatingPhrases = useMemo(
    () => [introText, lastSentenceText] as const,
    [introText, lastSentenceText],
  );

  const [typedText, setTypedText] = useState("");
  const [typedCtaText, setTypedCtaText] = useState("");
  const [hasIntroCompleted, setHasIntroCompleted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  const canSubmitForm = useMemo(() => {
    const parsed = signupSchema.safeParse({
      email,
      marketing_consent: marketingConsent,
    });
    return parsed.success;
  }, [email, marketingConsent]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setIsFormOpen(false);
      setSubmitSucceeded(false);
      setFormError(null);
    };
    window.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      emailFieldRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isFormOpen]);

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

      await typePhrase(introText);
      if (cancelled) return;

      setHasIntroCompleted(true);
      for (let index = 1; index <= ctaText.length; index += 1) {
        if (cancelled) return;
        setTypedCtaText(ctaText.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
      }

      let phraseIndex = 0;
      let currentPhrase = rotatingPhrases[phraseIndex]!;

      while (!cancelled) {
        await wait(PHRASE_HOLD_MS);
        if (cancelled) return;

        await deletePhrase(currentPhrase);
        if (cancelled) return;

        const nextIndex = (phraseIndex + 1) % rotatingPhrases.length;
        currentPhrase = rotatingPhrases[nextIndex]!;
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
  }, [introText, lastSentenceText, ctaText]);

  const showEmailOverlay = submitSucceeded || !!formError;
  const emailOverlayId = submitSucceeded
    ? "signup-success-message"
    : "signup-email-error";
  const emailOverlayClass = submitSucceeded
    ? styles.emailSubmitOverlaySuccess
    : styles.emailSubmitOverlayError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitSucceeded) {
      return;
    }
    const parsed = signupSchema.safeParse({
      email,
      marketing_consent: marketingConsent,
    });
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      const emailErr = fieldErrors.email?.[0];
      const consentErr = fieldErrors.marketing_consent?.[0];
      setFormError(emailErr ?? consentErr ?? "Invalid input.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

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
        setFormError(data.success ? "Signup failed." : data.error);
        return;
      }

      setSubmitSucceeded(true);
      setEmail("");
      setMarketingConsent(false);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className={
        isFormOpen ? `${styles.landing} ${styles.landingSheetOpen}` : styles.landing
      }
    >
      <div className={styles.heroBackgroundWrap}>
        <video
          className={styles.heroVideo}
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/vid-hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroVignette} aria-hidden />
      </div>

      <div className={styles.overlay} />

      <div className={styles.heroRow}>
        <div className={styles.headlineBlock} aria-hidden={isFormOpen}>
          <h1 className={styles.headline}>
            <span>Vid</span>
            <span className={styles.blinkingDot}>.</span>
            <span className={styles.headlineAfterVid}>{" "}</span>
            <span className={styles.typed}>{typedText}</span>
          </h1>
        </div>
      </div>

      {portalReady && hasIntroCompleted
        ? createPortal(
            <div
              className={
                isFormOpen
                  ? `${styles.ctaBlock} ${styles.ctaBlockSheetOpen}`
                  : styles.ctaBlock
              }
            >
              <div className={styles.ctaInner}>
                {isFormOpen ? (
                  <button
                    type="button"
                    className={`${styles.inlineCta} ${styles.inlineCtaClose}`}
                    aria-label="Close form"
                    onClick={() => {
                      setIsFormOpen(false);
                      setSubmitSucceeded(false);
                      setFormError(null);
                    }}
                  >
                    <span className={styles.inlineCtaText}>
                      <span className={styles.inlineCtaTypeTrack}>
                        <span className={styles.inlineCtaWidthReserve} aria-hidden>
                          {ctaText}
                        </span>
                        <span
                          className={`${styles.inlineCtaTyped} ${styles.inlineCtaCloseGlyph}`}
                          aria-hidden
                        >
                          ×
                        </span>
                      </span>
                    </span>
                    <span
                      className={`${styles.ctaArrow} ${styles.ctaArrowLayoutHold}`}
                      aria-hidden
                    >
                      →
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.inlineCta}
                    onClick={() => {
                      setFormError(null);
                      setSubmitSucceeded(false);
                      setMarketingConsent(false);
                      setIsFormOpen(true);
                    }}
                  >
                    <span className={styles.inlineCtaText}>
                      <span className={styles.inlineCtaTypeTrack}>
                        <span className={styles.inlineCtaWidthReserve} aria-hidden>
                          {ctaText}
                        </span>
                        <span className={styles.inlineCtaTyped}>{typedCtaText}</span>
                      </span>
                    </span>
                    {typedCtaText.length === ctaText.length ? (
                      <span className={styles.ctaArrow} aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </button>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      {portalReady && isFormOpen
        ? createPortal(
            <div
              className={styles.formOverlay}
              role="dialog"
              aria-modal="true"
              aria-label={submitSucceeded ? "Success" : "Request early access"}
            >
              <BouncingLogo />
              <div className={styles.formOverlayInner}>
                <div className={styles.formOverlayMain}>
                  <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <div
                      className={`${styles.field} ${styles.fieldLong} ${styles.emailSubmitRow}`}
                    >
                      <label htmlFor="signup-email" className={styles.visuallyHidden}>
                        Email address
                      </label>
                      <div className={styles.emailSubmitTrack}>
                        <div className={styles.emailSubmitInputSlot}>
                          <input
                            id="signup-email"
                            ref={emailFieldRef}
                            type="email"
                            name="email"
                            autoComplete="email"
                            aria-required="true"
                            aria-invalid={!!formError}
                            aria-describedby={
                              [
                                submitSucceeded ? "" : "signup-consent-notice",
                                showEmailOverlay ? emailOverlayId : "",
                              ]
                                .filter(Boolean)
                                .join(" ") || undefined
                            }
                            className={styles.emailSubmitInput}
                            placeholder="Email"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              if (formError) {
                                setFormError(null);
                              }
                            }}
                            disabled={isSubmitting || submitSucceeded}
                          />
                          {showEmailOverlay ? (
                            <div
                              id={emailOverlayId}
                              className={`${styles.emailSubmitOverlay} ${emailOverlayClass}`}
                              role={
                                formError && !submitSucceeded ? "alert" : "status"
                              }
                              aria-live="polite"
                            >
                              {submitSucceeded ? "Success" : formError}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="submit"
                          className={styles.submitArrowInline}
                          disabled={
                            isSubmitting || submitSucceeded || !canSubmitForm
                          }
                          aria-label={
                            submitSucceeded ? "Success" : "Submit signup"
                          }
                        >
                          <span
                            className={styles.submitArrowInlineGlyph}
                            aria-hidden
                          >
                            →
                          </span>
                        </button>
                      </div>
                    </div>

                    <div
                      className={
                        submitSucceeded
                          ? `${styles.formConsentRow} ${styles.formConsentRowVisuallyHidden}`
                          : styles.formConsentRow
                      }
                      aria-hidden={submitSucceeded}
                    >
                      <label className={styles.formConsentLabel}>
                        <span className={styles.formConsentControl}>
                          <input
                            id="signup-marketing-consent"
                            type="checkbox"
                            name="marketing_consent"
                            className={styles.formConsentCheckboxInput}
                            checked={marketingConsent}
                            onChange={(event) => {
                              setMarketingConsent(event.target.checked);
                              if (formError) {
                                setFormError(null);
                              }
                            }}
                            disabled={isSubmitting || submitSucceeded}
                            tabIndex={submitSucceeded ? -1 : undefined}
                          />
                          <span className={styles.formConsentBox} aria-hidden>
                            {marketingConsent ? (
                              <span className={styles.formConsentMark}>×</span>
                            ) : null}
                          </span>
                        </span>
                        <span
                          id="signup-consent-notice"
                          className={styles.formConsentText}
                        >
                          Receive platform updates and new releases.
                        </span>
                      </label>
                    </div>
                  </form>
                </div>

                <footer className={styles.formLegalFooter}>
                  <div className={styles.formLegalFooterRow}>
                    <span className={styles.formCopyright}>Vid. © 2026</span>
                    <Link href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms
                    </Link>
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </footer>
              </div>
            </div>,
            document.body,
          )
        : null}
    </main>
  );
}
