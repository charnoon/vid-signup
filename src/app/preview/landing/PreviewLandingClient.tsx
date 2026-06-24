"use client";

import { useEffect, useRef, useState } from "react";

import homeStyles from "@/app/page.module.css";
import introStyles from "../intro.module.css";
import { PreviewContent } from "../PreviewContent";
import {
  HERO_COPY,
  LANDING_DISCLAIMER,
  TYPE_INTERVAL_MS,
  TYPE_START_DELAY_MS,
  VISION_FULL_TEXT,
  VISION_LAUNCH_COPY,
  VISION_LEAD_COPY,
} from "./landing-copy";
import { PreviewLandingMobileFeed } from "./PreviewLandingMobileFeed";
import styles from "./preview-landing.module.css";

export function PreviewLandingClient() {
  const [heroTypedText, setHeroTypedText] = useState("");
  const [visionTypedText, setVisionTypedText] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const visionSectionRef = useRef<HTMLElement>(null);
  const heroTypeStartedRef = useRef(false);
  const visionTypeStartedRef = useRef(false);

  useEffect(() => {
    const section = heroSectionRef.current;
    const scrollRoot = mainRef.current;
    if (!section || !scrollRoot) {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const runHeroTypewriter = async () => {
      if (heroTypeStartedRef.current || cancelled) {
        return;
      }
      heroTypeStartedRef.current = true;

      await wait(TYPE_START_DELAY_MS);
      if (cancelled) return;

      for (let index = 1; index <= HERO_COPY.length; index += 1) {
        if (cancelled) return;
        setHeroTypedText(HERO_COPY.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          void runHeroTypewriter();
        }
      },
      { root: scrollRoot, threshold: [0, 0.5, 1] },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const section = visionSectionRef.current;
    const scrollRoot = mainRef.current;
    if (!section || !scrollRoot) {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const runVisionTypewriter = async () => {
      if (visionTypeStartedRef.current || cancelled) {
        return;
      }
      visionTypeStartedRef.current = true;

      await wait(TYPE_START_DELAY_MS);
      if (cancelled) return;

      for (let index = 1; index <= VISION_FULL_TEXT.length; index += 1) {
        if (cancelled) return;
        setVisionTypedText(VISION_FULL_TEXT.slice(0, index));
        await wait(TYPE_INTERVAL_MS);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          void runVisionTypewriter();
        }
      },
      { root: scrollRoot, threshold: [0, 0.5, 1] },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const visionLeadDisplayed = visionTypedText.slice(
    0,
    Math.min(visionTypedText.length, VISION_LEAD_COPY.length),
  );
  const visionLaunchDisplayed =
    visionTypedText.length > VISION_LEAD_COPY.length
      ? VISION_LAUNCH_COPY.slice(0, visionTypedText.length - VISION_LEAD_COPY.length)
      : "";

  return (
    <>
      <div className={styles.desktopLanding}>
        <main ref={mainRef} className={styles.previewLanding}>
          <div className={styles.fixedBrandBar}>
            <div className={introStyles.brandRow}>
              <a className={introStyles.brandVidLink} href="https://vid.global">
                <span className={introStyles.brandVidText}>
                  Vid<span className={homeStyles.blinkingDot}>.</span>
                </span>
              </a>
              <p className={introStyles.previewTagline}>Private Preview</p>
            </div>
          </div>

          <section
            ref={heroSectionRef}
            className={styles.heroSection}
            aria-label="Preview video"
          >
            <div className={styles.blockCopyInner}>
              <p className={styles.blockCopy} aria-live="polite">
                {heroTypedText}
              </p>
            </div>

            <div className={styles.videoColumn}>
              <div className={`${styles.videoColumnInner} ${introStyles.introEmbed}`}>
                <PreviewContent />
              </div>
            </div>
          </section>

          <section
            ref={visionSectionRef}
            className={styles.visionSection}
            aria-label="Launch information"
          >
            <div className={styles.visionBackground} aria-hidden>
              <video
                className={styles.visionBackgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src="/vid-hero-desktop.mp4" type="video/mp4" />
              </video>
              <div className={styles.visionBackgroundVignette} />
              <div className={styles.visionOverlay} />
            </div>

            <div className={styles.blockCopyInner}>
              <p className={styles.blockCopy}>{visionLeadDisplayed}</p>
              <p className={styles.blockLaunchCopy} aria-live="polite">
                {visionLaunchDisplayed}
              </p>
            </div>

            <p className={styles.landingDisclaimer} role="note">
              {LANDING_DISCLAIMER}
            </p>
          </section>
        </main>
      </div>

      <PreviewLandingMobileFeed />
    </>
  );
}
