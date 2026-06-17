export const INTRO_VIDEO_WIDTH = 1080;
export const INTRO_VIDEO_HEIGHT = 2250;
export const INTRO_VIDEO_ASPECT_RATIO = INTRO_VIDEO_WIDTH / INTRO_VIDEO_HEIGHT;

export type IntroStream = {
  kind: "hls";
  src: string;
};

export function getMuxIntroPlaybackId() {
  return process.env.NEXT_PUBLIC_MUX_INTRO_PLAYBACK_ID?.trim() || null;
}

export function getIntroStream(): IntroStream | null {
  const muxPlaybackId = getMuxIntroPlaybackId();
  if (!muxPlaybackId) return null;

  return {
    kind: "hls",
    src: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
  };
}

export function getIntroPoster() {
  const muxPlaybackId = getMuxIntroPlaybackId();
  if (!muxPlaybackId) return null;

  return `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=${INTRO_VIDEO_WIDTH}&time=0`;
}

export function supportsNativeHls(video: HTMLVideoElement) {
  return (
    video.canPlayType("application/vnd.apple.mpegurl") !== "" ||
    video.canPlayType("application/x-mpegURL") !== ""
  );
}
