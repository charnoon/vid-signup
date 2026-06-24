"use client";

import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from "react";

import homeStyles from "@/app/page.module.css";
import introStyles from "../intro.module.css";
import { previewLandingMobileVideoMediaQuery } from "../breakpoints";
import { PreviewContent } from "../PreviewContent";
import {
  HERO_COPY,
  HERO_AUTO_ADVANCE_DELAY_MS,
  LANDING_BACKGROUND_VIDEO_SRC,
  LANDING_DISCLAIMER,
  LANDING_DISCLAIMER_MOBILE,
  TYPE_INTERVAL_MS,
  TYPE_START_DELAY_MS,
  VISION_FULL_TEXT,
  VISION_LAUNCH_COPY,
  VISION_LEAD_COPY,
} from "./landing-copy";
import styles from "./preview-landing.module.css";
import { useBackgroundVideoOnVisible } from "./use-background-video-on-visible";

const FEED_SLIDE_COUNT = 3;

function subscribePreferMobileVideo(onStoreChange: () => void) {
  const media = window.matchMedia(previewLandingMobileVideoMediaQuery);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getPreferMobileVideoSnapshot() {
  return window.matchMedia(previewLandingMobileVideoMediaQuery).matches;
}

function getPreferMobileVideoServerSnapshot() {
  return true;
}

function usePreferMobileVideo() {
  return useSyncExternalStore(
    subscribePreferMobileVideo,
    getPreferMobileVideoSnapshot,
    getPreferMobileVideoServerSnapshot,
  );
}

function SlideBackground({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  return (
    <div className={styles.slideBackground} aria-hidden>
      <video
        ref={videoRef}
        className={styles.slideBackgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={LANDING_BACKGROUND_VIDEO_SRC} type="video/mp4" />
      </video>
      <div className={styles.slideBackgroundVignette} />
      <div className={styles.slideOverlay} />
    </div>
  );
}

export function PreviewLandingClient() {
  const preferMobileVideo = usePreferMobileVideo();
  const [heroTypedText, setHeroTypedText] = useState("");
  const [visionTypedText, setVisionTypedText] = useState("");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const feedRef = useRef<HTMLElement>(null);
  const heroSlideRef = useRef<HTMLElement>(null);
  const videoSlideRef = useRef<HTMLElement>(null);
  const visionSlideRef = useRef<HTMLElement>(null);
  const heroBackgroundVideoRef = useRef<HTMLVideoElement>(null);
  const visionBackgroundVideoRef = useRef<HTMLVideoElement>(null);
  const heroTypeStartedRef = useRef(false);
  const heroAutoAdvancedRef = useRef(false);
  const activeSlideIndexRef = useRef(0);
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
          activeSlideIndexRef.current = bestIndex;
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

      if (cancelled || heroAutoAdvancedRef.current || activeSlideIndexRef.current !== 0) {
        return;
      }

      await wait(HERO_AUTO_ADVANCE_DELAY_MS);
      if (cancelled || heroAutoAdvancedRef.current || activeSlideIndexRef.current !== 0) {
        return;
      }

      const feed = feedRef.current;
      const videoSlide = videoSlideRef.current;
      if (!feed || !videoSlide) {
        return;
      }

      heroAutoAdvancedRef.current = true;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feed.scrollTo({
        top: videoSlide.offsetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
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

  useBackgroundVideoOnVisible(feedRef, heroSlideRef, heroBackgroundVideoRef);
  useBackgroundVideoOnVisible(feedRef, visionSlideRef, visionBackgroundVideoRef);

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
    <div className={styles.landing}>
      <div className={styles.fixedBrandBar}>
        <div className={introStyles.brandRow}>
          <a className={introStyles.brandVidLink} href="https://vid.global">
            <span className={`${introStyles.brandVidText} ${styles.landingBrandVidText}`}>
              Vid<span className={homeStyles.blinkingDot}>.</span>
            </span>
          </a>
          <p className={`vid-display-bold ${styles.displayText} ${styles.tagline}`}>
            Private Preview
          </p>
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

      <main ref={feedRef} className={styles.feed} aria-label="Preview feed">
        <section
          ref={heroSlideRef}
          className={`${styles.feedSlide} ${styles.feedSlideHero}`}
          aria-label="Platform introduction"
        >
          <SlideBackground videoRef={heroBackgroundVideoRef} />

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
            preferMobileVideo={preferMobileVideo}
          />
        </section>

        <section
          ref={visionSlideRef}
          className={`${styles.feedSlide} ${styles.feedSlideVision}`}
          aria-label="Launch information"
        >
          <SlideBackground videoRef={visionBackgroundVideoRef} />

          <div className={styles.feedVisionCopy}>
            <p className={styles.feedCopy}>{visionLeadDisplayed}</p>
            <p className={styles.feedLaunchCopy} aria-live="polite">
              {visionLaunchDisplayed}
            </p>
          </div>

          <p
            className={`vid-display-bold ${styles.feedDisclaimer} ${styles.displayText} ${styles.feedDisclaimerMobile}`}
            role="note"
          >
            {LANDING_DISCLAIMER_MOBILE}
          </p>
          <p
            className={`vid-display-bold ${styles.feedDisclaimer} ${styles.displayText} ${styles.feedDisclaimerDesktop}`}
            role="note"
          >
            {LANDING_DISCLAIMER}
          </p>
        </section>
      </main>
    </div>
  );
}
