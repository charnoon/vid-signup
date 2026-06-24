import type { Metadata } from "next";

import {
  INTRO_VIDEO_DESKTOP_SRC,
  INTRO_VIDEO_MOBILE_SRC,
} from "../intro-stream";
import { PreviewLandingClient } from "./PreviewLandingClient";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

export const dynamic = "force-dynamic";

export default function PreviewLandingPage() {
  return (
    <>
      <link
        rel="preload"
        as="video"
        href={INTRO_VIDEO_DESKTOP_SRC}
        type="video/mp4"
        media="(min-width: 769px)"
      />
      <link
        rel="preload"
        as="video"
        href={INTRO_VIDEO_MOBILE_SRC}
        type="video/mp4"
        media="(max-width: 768px)"
      />
      <PreviewLandingClient />
    </>
  );
}
