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
import styles from "./preview-landing-mobile.module.css";

const FEED_SLIDE_COUNT = 3;

export function PreviewLandingMobileFeed() {
  const [heroTypedText, setHeroTypedText] = useState("");
  const [visionTypedText, setVisionTypedText] = useState("");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const feedRef = useRef<HTMLElement>(null);
  const heroSlideRef = useRef<HTMLElement>(null);
  const videoSlideRef = useRef<HTMLElement>(null);
  const visionSlideRef = useRef<HTMLElement>(null);
  const heroTypeStartedRef = useRef(false);
  const visionTypeStartedRef = useRef(false);

  useEffect(() => {
    const feed = feedRef.current;
    const slides = [heroSlideRef.current, videoSlideRef.current, visionSlideRef.current].filter(
      Boolean,
    ) as HTMLElement[];

    if (!feed || slides.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;

        for (const entry of entries) {
          const index = slides.indexOf(entry.target as HTMLElement);
          if (index >= 0 && entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestIndex = index;
            bestRatio = entry.intersectionRatio;
          }
        }

        if (bestIndex >= 0) {
          setActiveSlideIndex(bestIndex);
        }
      },
      { root: feed, threshold: [0, 0.35, 0.5, 0.65, 1] },
    );

    for (const slide of slides) {
      observer.observe(slide);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    const slide = heroSlideRef.current;
    if (!feed || !slide) {
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
      { root: feed, threshold: [0, 0.5, 1] },
    );

    observer.observe(slide);

    return () => {
      cancelled = true;
      observer.disconnect();
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    const slide = visionSlideRef.current;
    if (!feed || !slide) {
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
      { root: feed, threshold: [0, 0.5, 1] },
    );

    observer.observe(slide);

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
    <div className={styles.mobileLanding}>
      <div className={styles.fixedBrandBar}>
        <div className={introStyles.brandRow}>
          <a className={introStyles.brandVidLink} href="https://vid.global">
            <span className={introStyles.brandVidText}>
              Vid<span className={homeStyles.blinkingDot}>.</span>
            </span>
          </a>
          <p className={`${styles.mobileDisplayText} ${styles.mobileTagline}`}>Private Preview</p>
        </div>
      </div>

      <div className={styles.feedTimeline} aria-hidden>
        {Array.from({ length: FEED_SLIDE_COUNT }, (_, index) => (
          <span
            key={index}
            className={
              index === activeSlideIndex
                ? styles.feedTimelineSegmentActive
                : styles.feedTimelineSegment
            }
          />
        ))}
      </div>

      <main ref={feedRef} className={styles.mobileFeed} aria-label="Preview feed">
        <section
          ref={heroSlideRef}
          className={`${styles.feedSlide} ${styles.feedSlideHero}`}
          aria-label="Platform introduction"
        >
          <div className={styles.feedSlideInner}>
            <p className={styles.feedCopy} aria-live="polite">
              {heroTypedText}
            </p>
          </div>
        </section>

        <section
          ref={videoSlideRef}
          className={`${styles.feedSlide} ${styles.feedSlideVideo}`}
          aria-label="Preview video"
        >
          <PreviewContent
            className={styles.feedVideoContent}
            videoStageClassName={introStyles.videoStageFeedMobile}
          />
        </section>

        <section
          ref={visionSlideRef}
          className={`${styles.feedSlide} ${styles.feedSlideVision}`}
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

          <div className={styles.feedVisionCopy}>
            <p className={styles.feedCopy}>{visionLeadDisplayed}</p>
            <p className={styles.feedLaunchCopy} aria-live="polite">
              {visionLaunchDisplayed}
            </p>
          </div>

          <p className={`${styles.feedDisclaimer} ${styles.mobileDisplayText}`} role="note">
            {LANDING_DISCLAIMER}
          </p>
        </section>
      </main>
    </div>
  );
}
