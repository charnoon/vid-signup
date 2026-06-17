export const PROMO_SRC = "/assets/intro/vid-intro-promo.mp4";
export const PROMO_SRC_MOBILE = "/assets/intro/vid-intro-promo-mobile.mp4";
export const PROMO_POSTER = "/assets/intro/vid-intro-promo-poster.jpg";

export type IntroStream =
  | { kind: "mp4"; src: string }
  | { kind: "hls"; src: string };

export function getMuxIntroPlaybackId() {
  return process.env.NEXT_PUBLIC_MUX_INTRO_PLAYBACK_ID?.trim() || null;
}

export function getIntroStream(isTouch: boolean): IntroStream {
  const muxPlaybackId = getMuxIntroPlaybackId();

  if (muxPlaybackId) {
    return {
      kind: "hls",
      src: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
    };
  }

  if (isTouch) {
    return { kind: "mp4", src: PROMO_SRC_MOBILE };
  }

  return { kind: "mp4", src: PROMO_SRC };
}

export function supportsNativeHls(video: HTMLVideoElement) {
  return (
    video.canPlayType("application/vnd.apple.mpegurl") !== "" ||
    video.canPlayType("application/x-mpegURL") !== ""
  );
}
