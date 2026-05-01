import { HomePageClient } from "@/components/HomePageClient";
import { getHomeCopy } from "@/lib/home-copy";

/** Revalidate homepage so Supabase copy edits appear without redeploying (ISR). */
export const revalidate = 60;

export default async function Home() {
  const copy = await getHomeCopy();
  return <HomePageClient {...copy} />;
}
