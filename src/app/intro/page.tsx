import type { Metadata } from "next";

import { IntroVideo } from "./IntroVideo";
import {
  getIntroPoster,
  INTRO_VIDEO_DESKTOP_SRC,
  INTRO_VIDEO_MOBILE_SRC,
} from "./intro-stream";
import styles from "./intro.module.css";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

export default function IntroPage() {
  const poster = getIntroPoster();

  return (
    <main className={styles.page}>
      <link rel="preload" as="image" href={poster} fetchPriority="high" />
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
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG asset */}
          <img
            src="/logo.svg"
            alt="Vid."
            width={152}
            height={71}
            decoding="async"
          />
        </div>
      </div>
      <div className={styles.content}>
        <IntroVideo />
      </div>
    </main>
  );
}
