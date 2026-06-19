"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import {
  getIntroVideoSrc,
  INTRO_VIDEO_HEIGHT,
  INTRO_VIDEO_WIDTH,
  shouldUseMobileIntro,
} from "./intro-stream";
import styles from "./intro.module.css";

const LOAD_RAMP_MS = 2_500;
const PLAY_RETRY_MS = 400;
const CONTROLS_IDLE_MS = 3_000;

type IntroPhase = "loading" | "playing";

function OverlayStatus({ children }: { children: ReactNode }) {
  return <div className={styles.overlayStatus}>{children}</div>;
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
  const eased = 1 - (1 - progress) ** 2;

  return Math.min(100, Math.round(eased * 100));
}

function isMediaReady(video: HTMLVideoElement) {
  return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;

  // Safari on macOS reports ontouchstart; use primary input instead.
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function markVideoInline(video: HTMLVideoElement) {
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
}

export function IntroVideo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<IntroPhase>("loading");
  const loadStartedAtRef = useRef(0);
  const maxDisplayPercentRef = useRef(0);
  const loadCompleteRef = useRef(false);
  const lastPlayAttemptRef = useRef(0);
  const hasStartedPlaybackRef = useRef(false);
  const unlockMutedOnFirstPlayRef = useRef(false);
  const shouldEnterMobileFullscreenRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const isTouchRef = useRef(false);
  const controlsHideTimerRef = useRef<number | null>(null);
  const startPlaybackFromGestureRef = useRef<() => void>(() => {});

  const [isTouch, setIsTouch] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>("loading");
  const [loadPercent, setLoadPercent] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRebuffering, setIsRebuffering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const touch = isTouchDevice();
    setIsTouch(touch);
    isTouchRef.current = touch;
    setVideoSrc(getIntroVideoSrc(shouldUseMobileIntro()));
  }, []);

  const scheduleControlsHide = useCallback(() => {
    if (!isTouchRef.current) return;

    if (controlsHideTimerRef.current !== null) {
      window.clearTimeout(controlsHideTimerRef.current);
    }

    controlsHideTimerRef.current = window.setTimeout(() => {
      if (!isScrubbingRef.current) {
        setControlsVisible(false);
      }
    }, CONTROLS_IDLE_MS);
  }, []);

  const revealControls = useCallback(() => {
    if (!isTouchRef.current) return;

    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const requestMobileFullscreen = useCallback(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video || !isTouchRef.current) return;

    const webkitVideo = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };

    if (webkitVideo.webkitEnterFullscreen) {
      webkitVideo.webkitEnterFullscreen();
      return;
    }

    if (stage.requestFullscreen) {
      void stage.requestFullscreen();
    }
  }, []);

  const syncPlaybackState = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(!video.paused);
    setIsMuted(video.muted);
  };

  const resumePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    markVideoInline(video);
    void video.play().catch(() => {
      syncPlaybackState();
    });
  };

  startPlaybackFromGestureRef.current = () => {
    const video = videoRef.current;
    if (!video || phaseRef.current !== "loading") return;

    const now = Date.now();
    if (now - lastPlayAttemptRef.current < PLAY_RETRY_MS) return;
    lastPlayAttemptRef.current = now;

    markVideoInline(video);
    setPlayRequested(true);
    setShowPlayIcon(false);

    video.volume = 1;

    if (isTouchRef.current) {
      shouldEnterMobileFullscreenRef.current = true;
      video.muted = false;
      setIsMuted(false);
      unlockMutedOnFirstPlayRef.current = false;
    } else {
      video.muted = false;
      setIsMuted(false);
      unlockMutedOnFirstPlayRef.current = false;
    }

    const playPromise = video.play();
    if (!playPromise) return;

    playPromise.catch(() => {
      video.muted = true;
      unlockMutedOnFirstPlayRef.current = true;

      void video.play().catch(() => {
        setPlayRequested(false);
        setShowPlayIcon(true);
        unlockMutedOnFirstPlayRef.current = false;
        shouldEnterMobileFullscreenRef.current = false;
      });
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => {
      hasStartedPlaybackRef.current = true;
      setPhase("playing");
      setPlayRequested(false);
      setIsRebuffering(false);
      setShowPlayIcon(false);

      if (unlockMutedOnFirstPlayRef.current) {
        video.muted = false;
        video.volume = 1;
        unlockMutedOnFirstPlayRef.current = false;
      } else {
        video.muted = false;
        video.volume = 1;
      }

      syncPlaybackState();

      if (shouldEnterMobileFullscreenRef.current && isTouchRef.current) {
        shouldEnterMobileFullscreenRef.current = false;
        requestMobileFullscreen();
      }
    };

    const onPause = () => {
      syncPlaybackState();
    };

    const onWaiting = () => {
      if (hasStartedPlaybackRef.current) {
        setIsRebuffering(true);
      }
    };

    const onVolumeChange = () => {
      setIsMuted(video.muted);
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [requestMobileFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    loadStartedAtRef.current = Date.now();
    maxDisplayPercentRef.current = 0;
    loadCompleteRef.current = false;

    markVideoInline(video);
    // Muted preload helps Safari/WebKit start buffering before user gesture.
    video.muted = true;
    video.load();

    const finishLoading = () => {
      if (phaseRef.current !== "loading" || loadCompleteRef.current) return;

      loadCompleteRef.current = true;
      maxDisplayPercentRef.current = 100;
      setLoadPercent(100);
      setShowPlayIcon(true);
    };

    const syncLoadState = () => {
      if (phaseRef.current !== "loading") return;

      const mediaPercent = getMediaLoadPercent(video);
      const timedPercent = getTimedLoadPercent(loadStartedAtRef.current);
      const ready = isMediaReady(video);
      const rawPercent = Math.max(
        maxDisplayPercentRef.current,
        mediaPercent,
        timedPercent,
      );
      const nextPercent = ready ? Math.min(100, rawPercent) : Math.min(99, rawPercent);

      maxDisplayPercentRef.current = nextPercent;
      setLoadPercent(nextPercent);

      if (!loadCompleteRef.current && ready) {
        finishLoading();
      }
    };

    const onMediaEvent = () => {
      syncLoadState();
    };

    const onError = () => {
      if (phaseRef.current !== "loading") return;
      setShowPlayIcon(true);
    };

    const pollId = window.setInterval(syncLoadState, 80);

    video.addEventListener("loadstart", onMediaEvent);
    video.addEventListener("loadedmetadata", onMediaEvent);
    video.addEventListener("loadeddata", onMediaEvent);
    video.addEventListener("canplay", onMediaEvent);
    video.addEventListener("canplaythrough", onMediaEvent);
    video.addEventListener("progress", onMediaEvent);
    video.addEventListener("error", onError);

    syncLoadState();

    return () => {
      window.clearInterval(pollId);
      video.removeEventListener("loadstart", onMediaEvent);
      video.removeEventListener("loadedmetadata", onMediaEvent);
      video.removeEventListener("loadeddata", onMediaEvent);
      video.removeEventListener("canplay", onMediaEvent);
      video.removeEventListener("canplaythrough", onMediaEvent);
      video.removeEventListener("progress", onMediaEvent);
      video.removeEventListener("error", onError);
    };
  }, [videoSrc]);

  useEffect(() => {
    if (phase !== "playing" || !isTouch) return;

    setControlsVisible(true);
    scheduleControlsHide();

    return () => {
      if (controlsHideTimerRef.current !== null) {
        window.clearTimeout(controlsHideTimerRef.current);
      }
    };
  }, [phase, isTouch, scheduleControlsHide]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || phase !== "loading") return;

    const onActivate = () => {
      startPlaybackFromGestureRef.current();
    };

    overlay.addEventListener("touchstart", onActivate, { passive: true });
    overlay.addEventListener("click", onActivate);

    return () => {
      overlay.removeEventListener("touchstart", onActivate);
      overlay.removeEventListener("click", onActivate);
    };
  }, [phase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || phase !== "playing") return;

    let frameId = 0;

    const tick = () => {
      if (video.duration && Number.isFinite(video.duration) && !isScrubbingRef.current) {
        setProgress(video.currentTime / video.duration);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    const onSeeked = () => {
      setIsRebuffering(false);
      if (video.duration && Number.isFinite(video.duration)) {
        setProgress(video.currentTime / video.duration);
      }
    };

    video.addEventListener("seeked", onSeeked);

    return () => {
      window.cancelAnimationFrame(frameId);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [phase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (phaseRef.current === "loading" || isRebuffering) {
        setLoadPercent(getMediaLoadPercent(video));
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [isRebuffering]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const video = videoRef.current;
    const onWebkitBeginFullscreen = () => setIsFullscreen(true);
    const onWebkitEndFullscreen = () => setIsFullscreen(false);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    video?.addEventListener("webkitbeginfullscreen", onWebkitBeginFullscreen);
    video?.addEventListener("webkitendfullscreen", onWebkitEndFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      video?.removeEventListener("webkitbeginfullscreen", onWebkitBeginFullscreen);
      video?.removeEventListener("webkitendfullscreen", onWebkitEndFullscreen);
    };
  }, [videoSrc]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    revealControls();

    if (!video.paused) {
      video.pause();
      return;
    }

    if (isTouchRef.current) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
      shouldEnterMobileFullscreenRef.current = true;
    }

    resumePlayback();
  };

  const seekToRatio = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || !Number.isFinite(video.duration)) return;

    const clamped = Math.min(1, Math.max(0, ratio));
    video.currentTime = clamped * video.duration;
    setProgress(clamped);
  };

  const seekToPosition = (clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    if (rect.width <= 0) return;

    seekToRatio((clientX - rect.left) / rect.width);
  };

  const onTimelinePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    revealControls();
    isScrubbingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToPosition(event.clientX);
  };

  const onTimelinePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;

    seekToPosition(event.clientX);
  };

  const onTimelinePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;

    isScrubbingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    scheduleControlsHide();
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

    revealControls();
    unlockMutedOnFirstPlayRef.current = false;
    video.muted = !video.muted;

    if (!video.muted) {
      video.volume = 1;
    }

    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    revealControls();

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

  const onStageMouseLeave = () => {
    const stage = stageRef.current;
    if (!stage || isTouchRef.current) return;

    const active = document.activeElement;
    if (active instanceof HTMLElement && stage.contains(active)) {
      active.blur();
    }
  };

  const onStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isTouchRef.current || phase !== "playing") return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-intro-controls]")) return;

    revealControls();
  };

  const showLoadOverlay = phase === "loading";
  const overlayShowsPlay = showPlayIcon && !playRequested;

  return (
    <div
      ref={stageRef}
      className={styles.videoStage}
      onMouseLeave={onStageMouseLeave}
      onPointerDown={onStagePointerDown}
    >
      <video
        ref={videoRef}
        className={`${styles.video} ${phase === "loading" ? styles.videoHidden : ""}`}
        src={videoSrc}
        width={INTRO_VIDEO_WIDTH}
        height={INTRO_VIDEO_HEIGHT}
        loop
        playsInline
        preload="auto"
        poster=""
        aria-label="Vid. promo film"
      />
      {showLoadOverlay ? (
        <div className={styles.loadCurtain} aria-hidden />
      ) : null}
      {showLoadOverlay ? (
        <button
          ref={overlayRef}
          type="button"
          className={`${styles.mediaOverlay} ${styles.loadOverlay}`}
          aria-label={overlayShowsPlay ? "Play video" : `Loading video ${loadPercent}%`}
        >
          <OverlayStatus>
            {overlayShowsPlay ? (
              <span className={styles.overlayPlayPill}>
                <span className={styles.overlayPlayLabel}>PLAY</span>
              </span>
            ) : (
              <span className={styles.overlayPercent}>{loadPercent}</span>
            )}
          </OverlayStatus>
        </button>
      ) : null}
      {phase === "playing" && isRebuffering ? (
        <div className={styles.mediaOverlay} role="status" aria-label="Buffering video">
          <OverlayStatus>
            <span className={styles.overlayPercent}>{loadPercent}</span>
          </OverlayStatus>
        </div>
      ) : null}
      {phase === "playing" ? (
        <div
          className={`${styles.controlsDock} ${
            isTouch && !controlsVisible ? styles.controlsDockHidden : ""
          }`}
          data-intro-controls
        >
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
              onPointerDown={onTimelinePointerDown}
              onPointerMove={onTimelinePointerMove}
              onPointerUp={onTimelinePointerUp}
              onPointerCancel={onTimelinePointerUp}
              onKeyDown={onTimelineKeyDown}
            >
              <div className={styles.timelineTrack}>
                <div
                  className={styles.timelineProgress}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
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
        </div>
      ) : null}
    </div>
  );
}
