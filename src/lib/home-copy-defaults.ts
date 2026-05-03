/** Fallback when Supabase is unavailable or rows are missing. */
export type HomeCopy = {
  introText: string;
  lastSentenceText: string;
  ctaText: string;
};

export const DEFAULT_HOME_COPY: HomeCopy = {
  introText: "is an online platform for new music visuals.",
  lastSentenceText: "prioritises curation over algorithms.",
  ctaText: "REQUEST EARLY ACCESS",
};
