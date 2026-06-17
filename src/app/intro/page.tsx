import type { Metadata } from "next";

import { IntroVideo } from "./IntroVideo";
import styles from "./intro.module.css";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

export default function IntroPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG asset */}
          <img
            src="/logo.svg"
            alt="Vid."
            width={96}
            height={45}
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
