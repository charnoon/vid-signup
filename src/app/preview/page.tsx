import type { Metadata } from "next";

import { PreviewContent } from "./PreviewContent";
import { PreviewDisclaimerLink } from "./PreviewDisclaimerLink";
import {
  INTRO_VIDEO_DESKTOP_SRC,
  INTRO_VIDEO_MOBILE_SRC,
} from "./intro-stream";
import homeStyles from "@/app/page.module.css";
import styles from "./intro.module.css";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

// Ensure each deploy serves fresh intro assets (player UI updates often).
export const dynamic = "force-dynamic";

export default async function IntroPage() {
  return (
    <main className={styles.page}>
      <link
        rel="preload"
        as="video"
        href={INTRO_VIDEO_DESKTOP_SRC}
        type="video/mp4"
        media="(min-width: 769px)"
      />
      <link
        rel="preload"
        as="video"
        href={INTRO_VIDEO_MOBILE_SRC}
        type="video/mp4"
        media="(max-width: 768px)"
      />
      <div className={styles.topBar}>
        <div className={styles.brandRow}>
          <a className={styles.brandVidLink} href="https://vid.global">
            <span className={styles.brandVidText}>
              Vid<span className={homeStyles.blinkingDot}>.</span>
            </span>
          </a>
          <p className={styles.previewTagline}>Preview</p>
        </div>
      </div>
      <PreviewDisclaimerLink />
      <div className={styles.content}>
        <PreviewContent />
      </div>
    </main>
  );
}
