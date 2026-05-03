import { HomePageClient } from "@/components/HomePageClient";
import { DEFAULT_HOME_COPY } from "@/lib/home-copy-defaults";

export default function Home() {
  return <HomePageClient {...DEFAULT_HOME_COPY} />;
}
