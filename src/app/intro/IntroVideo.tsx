"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import styles from "./intro.module.css";

const PROMO_SRC = "/assets/intro/vid-intro-promo.mp4";
const PROMO_POSTER = "/assets/intro/vid-intro-promo-poster.jpg";

type IntroPhase = "buffering" | "ready" | "playing";

function ViewfinderFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewfinderFrame}>
      <span className={styles.viewfinderCorner} data-corner="tl" aria-hidden />
      <span className={styles.viewfinderCorner} data-corner="tr" aria-hidden />
      <span className={styles.viewfinderCorner} data-corner="bl" aria-hidden />
      <span className={styles.viewfinderCorner} data-corner="br" aria-hidden />
      <div className={styles.viewfinderCenter}>{children}</div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5.5 3.75v8.5l7-4.25-7-4.25z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className={styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4.75 3.75h2v8.5h-2v-8.5zm4.5 0h2v8.5h-2v-8.5z" fill="currentColor" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg className={styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 6.5v3h2.5L9 13.5V2.5L5.5 6.5H3z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 5.5 14.5 8.5M14.5 5.5 11.5 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg className={styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 6.5v3h2.5L9 13.5V2.5L5.5 6.5H3z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M11 5.5c1.2 1 1.9 2.3 1.9 2.5s-.7 1.5-1.9 2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className={styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5.5 2.5H3v2.5M10.5 2.5H13v2.5M5.5 13.5H3V11M10.5 13.5H13V11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg className={styles.controlIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 2.5H3v3M10 2.5h3v3M6 13.5H3v-3M10 13.5h3v-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LOAD_RAMP_MS = 14_000;
const READY_FALLBACK_MS = 16_000;

function getBufferedPercent(video: HTMLVideoElement) {
  if (!video.duration || !Number.isFinite(video.duration) || video.duration <= 0) {
    return 0;
  }

  if (video.buffered.length === 0) {
    return 0;
  }

  let bufferedEnd = 0;
  for (let index = 0; index < video.buffered.length; index += 1) {
    bufferedEnd = Math.max(bufferedEnd, video.buffered.end(index));
  }

  return Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
}

function getReadinessPercent(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
    return 100;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return 85;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return 60;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return 30;
  }

  return 0;
}

function getMediaLoadPercent(video: HTMLVideoElement) {
  return Math.min(100, Math.max(getReadinessPercent(video), getBufferedPercent(video)));
}

function getTimedLoadPercent(startedAt: number) {
  const elapsed = Date.now() - startedAt;
  const progress = Math.min(1, elapsed / LOAD_RAMP_MS);
  const eased = 1 - (1 - progress) ** 3;

  return Math.floor(eased * 100);
}

function canShowPlayPrompt(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return true;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return true;
  }

  return video.readyState >= HTMLMediaElement.HAVE_METADATA && video.buffered.length > 0;
}

export function IntroVideo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<IntroPhase>("buffering");
  const loadStartedAtRef = useRef(0);
  const maxDisplayPercentRef = useRef(0);

  const [phase, setPhase] = useState<IntroPhase>("buffering");
  const [loadPercent, setLoadPercent] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRebuffering, setIsRebuffering] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    loadStartedAtRef.current = Date.now();
    maxDisplayPercentRef.current = 0;
    video.load();

    const syncLoadState = () => {
      if (phaseRef.current !== "buffering") return;

      const mediaPercent = getMediaLoadPercent(video);
      const timedPercent = getTimedLoadPercent(loadStartedAtRef.current);
      const elapsed = Date.now() - loadStartedAtRef.current;
      const canFinish = canShowPlayPrompt(video) || elapsed >= READY_FALLBACK_MS;

      let nextPercent = Math.max(maxDisplayPercentRef.current, mediaPercent, timedPercent);

      if (!canFinish) {
        nextPercent = Math.min(nextPercent, 99);
      } else {
        nextPercent = 100;
      }

      maxDisplayPercentRef.current = nextPercent;
      setLoadPercent(nextPercent);

      if (canFinish && nextPercent >= 100) {
        setPhase("ready");
      }
    };

    const onMediaEvent = () => {
      syncLoadState();
    };

    const pollId = window.setInterval(syncLoadState, 100);

    video.addEventListener("loadstart", onMediaEvent);
    video.addEventListener("loadedmetadata", onMediaEvent);
    video.addEventListener("loadeddata", onMediaEvent);
    video.addEventListener("canplay", onMediaEvent);
    video.addEventListener("canplaythrough", onMediaEvent);
    video.addEventListener("progress", onMediaEvent);
    video.addEventListener("stalled", onMediaEvent);
    video.addEventListener("suspend", onMediaEvent);

    syncLoadState();

    return () => {
      window.clearInterval(pollId);
      video.removeEventListener("loadstart", onMediaEvent);
      video.removeEventListener("loadedmetadata", onMediaEvent);
      video.removeEventListener("loadeddata", onMediaEvent);
      video.removeEventListener("canplay", onMediaEvent);
      video.removeEventListener("canplaythrough", onMediaEvent);
      video.removeEventListener("progress", onMediaEvent);
      video.removeEventListener("stalled", onMediaEvent);
      video.removeEventListener("suspend", onMediaEvent);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!video.duration) return;
      setProgress(video.currentTime / video.duration);
      if (phase === "playing") {
        setLoadPercent(getMediaLoadPercent(video));
      }
    };
    const onWaiting = () => setIsRebuffering(true);
    const onPlaying = () => {
      setIsRebuffering(false);
      setIsMuted(video.muted);
      setLoadPercent(getMediaLoadPercent(video));
    };
    const onSeeked = () => setIsRebuffering(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeked", onSeeked);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [phase]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const startPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    setIsMuted(false);

    try {
      await video.play();
      setPhase("playing");
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void startPlayback();
      return;
    }

    video.pause();
  };

  const seekToPosition = (clientX: number) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline || !video.duration) return;

    const rect = timeline.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  };

  const onTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    seekToPosition(event.clientX);
  };

  const onTimelineKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      video.currentTime = Math.min(video.duration, video.currentTime + 1);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      video.volume = 1;
      void video.play();
    }
  };

  const toggleFullscreen = async () => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (stage.requestFullscreen) {
      await stage.requestFullscreen();
      return;
    }

    const webkitVideo = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    webkitVideo.webkitEnterFullscreen?.();
  };

  const showBuffering = phase === "buffering" || (phase === "playing" && isRebuffering);
  const showPlayPrompt = phase === "ready";

  return (
    <div ref={stageRef} className={styles.videoStage}>
      <video
        ref={videoRef}
        className={styles.video}
        src={PROMO_SRC}
        poster={PROMO_POSTER}
        loop
        playsInline
        preload="auto"
        aria-label="Vid. promo film"
      />
      {showBuffering ? (
        <div className={styles.mediaOverlay} role="status" aria-label="Loading video">
          <ViewfinderFrame>
            <span className={styles.viewfinderPercent}>{loadPercent}</span>
          </ViewfinderFrame>
        </div>
      ) : null}
      {showPlayPrompt ? (
        <button
          type="button"
          className={styles.mediaOverlay}
          onClick={() => void startPlayback()}
          aria-label="Play video"
        >
          <ViewfinderFrame>
            <PlayIcon className={styles.viewfinderPlay} />
          </ViewfinderFrame>
        </button>
      ) : null}
      {phase === "playing" ? (
        <div className={styles.controlsBar}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={togglePlay}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div
            ref={timelineRef}
            className={styles.timeline}
            role="slider"
            tabIndex={0}
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            onClick={onTimelineClick}
            onKeyDown={onTimelineKeyDown}
          >
            <div
              className={styles.timelineProgress}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className={styles.controlGroup}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={toggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={() => void toggleFullscreen()}
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
