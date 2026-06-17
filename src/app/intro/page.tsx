import type { Metadata } from "next";

import { IntroVideo } from "./IntroVideo";
import {
  INTRO_VIDEO_DESKTOP_SRC,
  INTRO_VIDEO_MOBILE_SRC,
} from "./intro-stream";
import { VID_LOGO_HEIGHT, VID_LOGO_SRC, VID_LOGO_WIDTH } from "@/lib/logo";
import logoStyles from "@/styles/logo.module.css";
import styles from "./intro.module.css";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

// Ensure each deploy serves fresh intro assets (player UI updates often).
export const dynamic = "force-dynamic";

export default function IntroPage() {
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
      <div className={styles.content}>
        <div className={styles.topBar}>
          <a className={`${logoStyles.link} ${styles.logo}`} href="https://vid.global">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG asset */}
            <img
              className={`${logoStyles.mark} ${styles.logoMark}`}
              src={VID_LOGO_SRC}
              alt="Vid."
              width={VID_LOGO_WIDTH}
              height={VID_LOGO_HEIGHT}
              decoding="async"
            />
          </a>
          <a className={styles.enquireLink} href="mailto:info@vid.global">
            <span className={styles.enquireLinkText}>Enquire</span>
            <span className={styles.enquireLinkArrow} aria-hidden="true">
              →
            </span>
          </a>
        </div>
        <IntroVideo />
      </div>
    </main>
  );
}
