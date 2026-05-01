import { getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_HOME_COPY, type HomeCopy } from "@/lib/home-copy-defaults";

const KEYS = ["intro_text", "last_sentence_text", "cta_text"] as const;

/**
 * Loads homepage headline copy from `public.site_copy` (key/value).
 * Uses defaults if env is missing, the query fails, or keys are absent.
 */
export async function getHomeCopy(): Promise<HomeCopy> {
  const defaults = DEFAULT_HOME_COPY;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return defaults;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_copy")
      .select("key, value")
      .in("key", [...KEYS]);

    if (error || !data?.length) {
      return defaults;
    }

    const map = Object.fromEntries(
      data.map((row: { key: string; value: string }) => [row.key, row.value]),
    ) as Record<string, string | undefined>;

    return {
      introText:
        map.intro_text?.trim() || defaults.introText,
      lastSentenceText:
        map.last_sentence_text?.trim() || defaults.lastSentenceText,
      ctaText: map.cta_text?.trim() || defaults.ctaText,
    };
  } catch {
    return defaults;
  }
}
