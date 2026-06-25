"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import landingStyles from "@/app/preview/landing/preview-landing.module.css";
import {
  HERO_COPY,
  LANDING_BACKGROUND_VIDEO_SRC,
  TYPE_INTERVAL_MS,
  TYPE_START_DELAY_MS,
} from "@/app/preview/landing/landing-copy";
import { useFeedViewportHeight } from "@/app/preview/landing/use-feed-viewport-height";
import introStyles from "@/app/preview/intro.module.css";
import styles from "@/app/page.module.css";
import { BouncingLogo } from "@/components/BouncingLogo";
import { signupSchema, type SignupResponse } from "@/lib/validation";

const BRAND_BAR_CTA = "Request Early Access";

export function HomePageClient() {
  const [typedText, setTypedText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const heroMainRef = useRef<HTMLElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  useFeedViewportHeight(landingRef, heroMainRef);

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

    const runTypewriter = async () => {
      await wait(TYPE_START_DELAY_MS);
      if (cancelled) return;

      for (let index = 1; index <= HERO_COPY.length; index += 1) {
        if (cancelled) return;
        setTypedText(HERO_COPY.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
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

  const showEmailOverlay = submitSucceeded || !!formError;
  const emailOverlayId = submitSucceeded
    ? "signup-success-message"
    : "signup-email-error";
  const emailOverlayClass = submitSucceeded
    ? styles.emailSubmitOverlaySuccess
    : styles.emailSubmitOverlayError;

  const closeForm = () => {
    setIsFormOpen(false);
    setSubmitSucceeded(false);
    setFormError(null);
  };

  const openForm = () => {
    setFormError(null);
    setSubmitSucceeded(false);
    setMarketingConsent(false);
    setIsFormOpen(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitSucceeded || isSubmitting) {
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
        setFormError("Something went wrong. Please try again.");
        return;
      }

      setSubmitSucceeded(true);
      setEmail("");
      setMarketingConsent(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: "html,body{background:#000;color:#fff}",
        }}
      />
      <div
        ref={landingRef}
        className={`${landingStyles.landing} ${isFormOpen ? styles.homeSheetOpen : ""}`.trim()}
      >
        <div
          className={`${landingStyles.fixedBrandBar} ${isFormOpen ? styles.homeBrandBarSheetOpen : ""}`.trim()}
        >
          <div className={introStyles.brandRow}>
            {isFormOpen ? (
              <button
                type="button"
                className={`vid-display-bold ${landingStyles.displayText} ${landingStyles.tagline} ${styles.brandBarButton} ${styles.brandBarButtonClose}`}
                aria-label="Close form"
                onClick={closeForm}
              >
                ×
              </button>
            ) : (
              <button
                type="button"
                className={`vid-display-bold ${landingStyles.displayText} ${landingStyles.tagline} ${styles.brandBarButton}`}
                onClick={openForm}
              >
                {BRAND_BAR_CTA}
              </button>
            )}
          </div>
        </div>

        <main ref={heroMainRef} className={styles.homeHeroMain} aria-label="Vid. introduction">
          <section
            className={`${landingStyles.feedSlide} ${landingStyles.feedSlideHero}`}
            aria-label="Platform introduction"
          >
            <div className={landingStyles.slideBackground} aria-hidden>
              <video
                className={landingStyles.slideBackgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src={LANDING_BACKGROUND_VIDEO_SRC} type="video/mp4" />
              </video>
              <div className={landingStyles.slideBackgroundVignette} />
              <div className={landingStyles.slideOverlay} />
            </div>

            <div
              className={`${landingStyles.feedSlideInner} ${isFormOpen ? styles.homeHeroCopyHidden : ""}`.trim()}
              aria-hidden={isFormOpen}
            >
              <p className={landingStyles.feedCopy} aria-live="polite">
                {typedText}
              </p>
            </div>
          </section>
        </main>
      </div>

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
                        </div>
                        {showEmailOverlay ? (
                          <div
                            id={emailOverlayId}
                            className={`${styles.emailSubmitOverlay} ${emailOverlayClass}`}
                            role={
                              formError && !submitSucceeded ? "alert" : "status"
                            }
                            aria-live="polite"
                          >
                            {submitSucceeded ? "SUCCESS!" : formError}
                          </div>
                        ) : null}
                        <button
                          type="submit"
                          className={styles.submitArrowInline}
                          disabled={
                            isSubmitting || submitSucceeded || !canSubmitForm
                          }
                          aria-label={
                            submitSucceeded ? "SUCCESS!" : "Submit signup"
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
                          Receive platform updates and new releases
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
    </>
  );
}
