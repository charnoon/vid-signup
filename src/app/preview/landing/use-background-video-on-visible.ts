import { useEffect, type RefObject } from "react";

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
      void video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { root: scrollRoot, threshold: [0, 0.1, 0.25, 0.5, 1] },
    );

    observer.observe(slide);

    return () => {
      observer.disconnect();
    };
  }, [scrollRootRef, slideRef, videoRef]);
}
