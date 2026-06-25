import { HomePageClient } from "@/components/HomePageClient";

/** Avoid long-lived static HTML so production picks up new deploys without stale CDN/browser shells. */
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomePageClient />;
}
