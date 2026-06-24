"use client";

import { type RefObject, useRef } from "react";

import { IntroVideo, type IntroVideoHandle } from "./IntroVideo";
import styles from "./intro.module.css";

type PreviewContentProps = {
  className?: string;
  videoLoop?: boolean;
  onVideoEnded?: () => void;
  videoRef?: RefObject<IntroVideoHandle | null>;
};

export function PreviewContent({
  className,
  videoLoop,
  onVideoEnded,
  videoRef: externalVideoRef,
}: PreviewContentProps) {
  const internalVideoRef = useRef<IntroVideoHandle>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;

  return (
    <div className={`${styles.previewContent} ${className ?? ""}`.trim()}>
      <IntroVideo ref={videoRef} loop={videoLoop} onEnded={onVideoEnded} />
    </div>
  );
}
