/** Fallback when Supabase is unavailable or rows are missing. */
export type HomeCopy = {
  introText: string;
  lastSentenceText: string;
  ctaText: string;
};

export const DEFAULT_HOME_COPY: HomeCopy = {
  introText: "is an online platform for new music visuals.",
  lastSentenceText: "Music television for the streaming era.",
  ctaText: "REQUEST EARLY ACCESS",
};
