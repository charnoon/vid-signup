import { useEffect, type RefObject } from "react";

import { isFeedSlideMostlyVisible } from "./feed-scroll";

export function useBackgroundVideoOnVisible(
  scrollRootRef: RefObject<HTMLElement | null>,
  slideRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  useEffect(() => {
    const scrollRoot = scrollRootRef.current;
    const slide = slideRef.current;
    const video = videoRef.current;
    if (!scrollRoot || !slide || !video) {
      return;
    }

    const tryPlay = () => {
      video.muted = true;
      markVideoInline(video);
      void video.play().catch(() => {});
    };

    const sync = () => {
      if (isFeedSlideMostlyVisible(slide, scrollRoot, 0.25)) {
        tryPlay();
      } else {
        video.pause();
      }
    };

    sync();
    scrollRoot.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      scrollRoot.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [scrollRootRef, slideRef, videoRef]);
}

function markVideoInline(video: HTMLVideoElement) {
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
}
