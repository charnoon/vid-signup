"use client";

import { useRef, useState } from "react";

import { IntroAccessGate } from "./IntroAccessGate";
import { IntroVideo, type IntroVideoHandle } from "./IntroVideo";
import styles from "./intro.module.css";

type PreviewContentProps = {
  initialHasAccess: boolean;
};

export function PreviewContent({ initialHasAccess }: PreviewContentProps) {
  const videoRef = useRef<IntroVideoHandle>(null);
  const [hasAccess, setHasAccess] = useState(initialHasAccess);

  return (
    <div className={styles.previewContent}>
      <IntroVideo ref={videoRef} />
      {!hasAccess ? (
        <div className={styles.accessOverlay}>
          <IntroAccessGate
            onEnterPress={() => {
              videoRef.current?.startPlaybackFromGesture();
            }}
            onAccessGranted={() => {
              setHasAccess(true);
            }}
            onAccessDenied={() => {
              videoRef.current?.pauseFromAccessDenied();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
