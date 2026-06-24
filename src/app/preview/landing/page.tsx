import type { Metadata } from "next";

import {
  INTRO_VIDEO_DESKTOP_SRC,
  INTRO_VIDEO_MOBILE_SRC,
  previewLandingMobileVideoMediaQuery,
  previewLandingOriginalVideoMediaQuery,
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
        media={previewLandingOriginalVideoMediaQuery}
      />
      <link
        rel="preload"
        as="video"
        href={INTRO_VIDEO_MOBILE_SRC}
        type="video/mp4"
        media={previewLandingMobileVideoMediaQuery}
      />
      <PreviewLandingClient />
    </>
  );
}
