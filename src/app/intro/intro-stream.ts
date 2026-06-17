export const INTRO_VIDEO_WIDTH = 1080;
export const INTRO_VIDEO_HEIGHT = 2250;
export const INTRO_VIDEO_ASPECT_RATIO = INTRO_VIDEO_WIDTH / INTRO_VIDEO_HEIGHT;

export const INTRO_VIDEO_DESKTOP_SRC = "/assets/intro/vid-intro-film.mp4";
export const INTRO_VIDEO_MOBILE_SRC = "/assets/intro/vid-intro-film-mobile.mp4";
export const INTRO_VIDEO_POSTER_SRC = "/assets/intro/vid-intro-film-poster.jpg";

/** Editorial frame stamp: 1 second + 21 frames @ 30fps */
export const INTRO_POSTER_TIMECODE = "1s21f";
export const INTRO_POSTER_SECONDS = 1;
export const INTRO_POSTER_FRAMES = 21;
export const INTRO_POSTER_FPS = 30;

export function introPosterSeekSeconds(
  seconds = INTRO_POSTER_SECONDS,
  frames = INTRO_POSTER_FRAMES,
  fps = INTRO_POSTER_FPS,
): number {
  return seconds + frames / fps;
}

export function getIntroVideoSrc(preferMobile: boolean) {
  return preferMobile ? INTRO_VIDEO_MOBILE_SRC : INTRO_VIDEO_DESKTOP_SRC;
}

export function getIntroPoster() {
  return INTRO_VIDEO_POSTER_SRC;
}

export function shouldUseMobileIntro() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches
  );
}
