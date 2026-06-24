"use client";

import { type RefObject, useRef, useState } from "react";

import { IntroAccessGate } from "./IntroAccessGate";
import { IntroVideo, type IntroVideoHandle } from "./IntroVideo";
import styles from "./intro.module.css";

type PreviewContentProps = {
  initialHasAccess: boolean;
  className?: string;
  videoLoop?: boolean;
  feedAutoplay?: boolean;
  onVideoEnded?: () => void;
  onAccessGranted?: () => void;
  videoRef?: RefObject<IntroVideoHandle | null>;
};

export function PreviewContent({
  initialHasAccess,
  className,
  videoLoop,
  feedAutoplay = false,
  onVideoEnded,
  onAccessGranted,
  videoRef: externalVideoRef,
}: PreviewContentProps) {
  const internalVideoRef = useRef<IntroVideoHandle>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const [hasAccess, setHasAccess] = useState(initialHasAccess);

  return (
    <div className={`${styles.previewContent} ${className ?? ""}`.trim()}>
      <IntroVideo ref={videoRef} loop={videoLoop} onEnded={onVideoEnded} />
      {!hasAccess ? (
        <div className={styles.accessOverlay}>
          <IntroAccessGate
            onEnterPress={() => {
              if (feedAutoplay) {
                videoRef.current?.startFeedPlayback();
                return;
              }

              videoRef.current?.startPlaybackFromGesture();
            }}
            onAccessGranted={() => {
              setHasAccess(true);
              onAccessGranted?.();
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
