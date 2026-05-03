import { HomePageClient } from "@/components/HomePageClient";
import { DEFAULT_HOME_COPY } from "@/lib/home-copy-defaults";

/** Avoid long-lived static HTML so production picks up new deploys without stale CDN/browser shells. */
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomePageClient {...DEFAULT_HOME_COPY} />;
}
