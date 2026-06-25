import type { Metadata } from "next";

import { PreviewLandingClient } from "./PreviewLandingClient";

export const metadata: Metadata = {
  title: "Vid.",
  description: "A new platform for music visuals.",
};

export const dynamic = "force-dynamic";

export default function PreviewLandingPage() {
  return <PreviewLandingClient />;
}
