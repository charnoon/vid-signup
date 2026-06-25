import { previewLandingDesktopMediaQuery, previewLandingMobileMediaQuery } from "./breakpoints";

export const INTRO_VIDEO_WIDTH = 1080;
export const INTRO_VIDEO_HEIGHT = 2250;
export const INTRO_VIDEO_MOBILE_WIDTH = 720;
export const INTRO_VIDEO_MOBILE_HEIGHT = 1500;
export const INTRO_VIDEO_ASPECT_RATIO = INTRO_VIDEO_WIDTH / INTRO_VIDEO_HEIGHT;
export const INTRO_VIDEO_MOBILE_ASPECT_RATIO =
  INTRO_VIDEO_MOBILE_WIDTH / INTRO_VIDEO_MOBILE_HEIGHT;

export function getIntroVideoFrameDimensions(preferMobile: boolean) {
  return preferMobile
    ? { width: INTRO_VIDEO_MOBILE_WIDTH, height: INTRO_VIDEO_MOBILE_HEIGHT }
    : { width: INTRO_VIDEO_WIDTH, height: INTRO_VIDEO_HEIGHT };
}

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

export {
  PREVIEW_LANDING_DESKTOP_MIN_WIDTH,
  PREVIEW_LANDING_MOBILE_MAX_WIDTH,
  PREVIEW_LANDING_MOBILE_VIDEO_MAX_WIDTH,
  PREVIEW_LANDING_ORIGINAL_VIDEO_MIN_WIDTH,
  previewLandingDesktopMediaQuery,
  previewLandingMobileMediaQuery,
  previewLandingMobileVideoMediaQuery,
  previewLandingOriginalVideoMediaQuery,
} from "./breakpoints";

export function shouldUseMobileIntro() {
  if (typeof window === "undefined") return false;

  // /preview intro page: pick film by viewport. Landing always passes preferMobileVideo.
  return window.matchMedia(previewLandingMobileMediaQuery).matches;
}
