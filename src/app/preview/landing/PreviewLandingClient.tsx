"use client";

import { useEffect, useState } from "react";

import homeStyles from "@/app/page.module.css";
import introStyles from "../intro.module.css";
import { PreviewContent } from "../PreviewContent";
import { PreviewDisclaimerLink } from "../PreviewDisclaimerLink";
import styles from "./preview-landing.module.css";

const PREVIEW_LANDING_HEADLINE = "is a new platform\nfor new music visuals.";
const REVEAL_DELAY_MS = 2000;
const TYPE_INTERVAL_MS = 45;

type PreviewLandingClientProps = {
  initialHasAccess: boolean;
};

export function PreviewLandingClient({ initialHasAccess }: PreviewLandingClientProps) {
  const headlineText = PREVIEW_LANDING_HEADLINE;
  const [typedText, setTypedText] = useState("");
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        timers.push(timer);
      });

    const runTypewriter = async () => {
      await wait(REVEAL_DELAY_MS);
      if (cancelled) return;

      for (let index = 1; index <= headlineText.length; index += 1) {
        if (cancelled) return;
        setTypedText(headlineText.slice(0, index));
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
  }, [headlineText]);

  return (
    <main className={`${homeStyles.landing} ${styles.previewLanding}`}>
      <div className={homeStyles.heroRow}>
        <div className={`${homeStyles.headlineBlock} ${styles.landingHeadlineBlock}`}>
          <h1 className={`${homeStyles.headline} ${styles.landingHeadline}`}>
            <span>Vid</span>
            <span className={homeStyles.blinkingDot}>.</span>
            <span className={homeStyles.headlineAfterVid}>{" "}</span>
            <span className={`${homeStyles.typed} ${styles.landingTyped}`}>{typedText}</span>
          </h1>
        </div>
      </div>

      <div className={`${homeStyles.ctaBlock} ${styles.landingBrandBar}`}>
        <div className={homeStyles.ctaInner}>
          <div className={introStyles.brandRow}>
            <p className={introStyles.previewTagline}>Private Preview</p>
          </div>
        </div>
      </div>

      <div className={styles.videoColumn}>
        <div className={`${styles.videoColumnInner} ${introStyles.introEmbed}`}>
          <PreviewContent initialHasAccess={initialHasAccess} />
        </div>
      </div>

      <PreviewDisclaimerLink
        dockClassName={`${introStyles.disclaimerDockLanding} ${styles.landingDisclaimer}`}
      />
    </main>
  );
}
