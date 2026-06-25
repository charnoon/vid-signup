"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import homeStyles from "@/app/page.module.css";
import introStyles from "../intro.module.css";
import { type IntroVideoHandle } from "../IntroVideo";
import { previewLandingMobileVideoMediaQuery } from "../breakpoints";
import { PreviewContent } from "../PreviewContent";
import {
  getFeedSlideVisibilityRatio,
  getMostVisibleFeedSlideIndex,
} from "./feed-scroll";
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
import { useFeedViewportHeight } from "./use-feed-viewport-height";

const FEED_SLIDE_COUNT = 3;
const ACTIVE_SLIDE_MIN_RATIO = 0.35;

function subscribePreferMobileVideo(onStoreChange: () => void) {
  const media = window.matchMedia(previewLandingMobileVideoMediaQuery);

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  }

  media.addListener(onStoreChange);
  return () => media.removeListener(onStoreChange);
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
  const landingRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const heroSlideRef = useRef<HTMLElement>(null);
  const videoSlideRef = useRef<HTMLElement>(null);
  const visionSlideRef = useRef<HTMLElement>(null);
  const heroBackgroundVideoRef = useRef<HTMLVideoElement>(null);
  const visionBackgroundVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<IntroVideoHandle>(null);
  const heroTypeStartedRef = useRef(false);
  const heroAutoAdvancedRef = useRef(false);
  const activeSlideIndexRef = useRef(0);
  const visionTypeStartedRef = useRef(false);
  const videoPlaybackStartedRef = useRef(false);

  useFeedViewportHeight(landingRef, feedRef);
  useBackgroundVideoOnVisible(feedRef, heroSlideRef, heroBackgroundVideoRef);
  useBackgroundVideoOnVisible(feedRef, visionSlideRef, visionBackgroundVideoRef);

  useEffect(() => {
    const feed = feedRef.current;
    const heroSlide = heroSlideRef.current;
    const videoSlide = videoSlideRef.current;
    const visionSlide = visionSlideRef.current;

    if (!feed || !heroSlide || !videoSlide || !visionSlide) {
      return;
    }

    const slides = [heroSlide, videoSlide, visionSlide];
    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const scrollToVideoSlide = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feed.scrollTo({
        top: videoSlide.offsetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    const tryStartVideoFeed = () => {
      const activeIndex = getMostVisibleFeedSlideIndex(slides, feed);
      const activeRatio = getFeedSlideVisibilityRatio(slides[activeIndex], feed);

      if (
        activeIndex === 1 &&
        activeRatio >= ACTIVE_SLIDE_MIN_RATIO &&
        !videoPlaybackStartedRef.current &&
        introVideoRef.current
      ) {
        videoPlaybackStartedRef.current = true;
        introVideoRef.current.startFeedPlayback();
      }
    };

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

      heroAutoAdvancedRef.current = true;
      scrollToVideoSlide();
    };

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

    const sync = () => {
      tryStartVideoFeed();

      const activeIndex = getMostVisibleFeedSlideIndex(slides, feed);
      const activeRatio = getFeedSlideVisibilityRatio(slides[activeIndex], feed);

      activeSlideIndexRef.current = activeIndex;
      setActiveSlideIndex(activeIndex);

      if (activeRatio < ACTIVE_SLIDE_MIN_RATIO) {
        return;
      }

      if (activeIndex === 0) {
        void runHeroTypewriter();
      }

      if (activeIndex === 2) {
        void runVisionTypewriter();
      }
    };

    sync();

    feed.addEventListener("scroll", sync, { passive: true });
    feed.addEventListener("touchend", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);

    return () => {
      cancelled = true;
      feed.removeEventListener("scroll", sync);
      feed.removeEventListener("touchend", sync);
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
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
    <div ref={landingRef} className={styles.landing}>
      <div className={styles.fixedBrandBar}>
        <div className={introStyles.brandRow}>
          <a className={introStyles.brandVidLink} href="https://vid.global">
            <span className={`${introStyles.brandVidText} ${styles.landingBrandVidText}`}>
              Vid<span className={homeStyles.blinkingDot}>.</span>
            </span>
          </a>
          <p className={`vid-display-bold ${styles.displayText} ${styles.tagline}`}>
            Preview
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
            videoRef={introVideoRef}
            feedPlayback
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
