import { useEffect, type RefObject } from "react";

export function useFeedViewportHeight(
  landingRef: RefObject<HTMLElement | null>,
  feedRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const landing = landingRef.current;
    const feed = feedRef.current;
    if (!landing || !feed) {
      return;
    }

    const apply = () => {
      const height = feed.clientHeight;
      if (height <= 0) {
        return;
      }

      landing.style.setProperty("--landing-slide-height", `${height}px`);
    };

    apply();

    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(feed);

    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
    };
  }, [feedRef, landingRef]);
}
