/** Homepage headline / CTA strings (hardcoded; edit here to change the landing copy). */
export type HomeCopy = {
  introText: string;
  lastSentenceText: string;
  ctaText: string;
};

export const DEFAULT_HOME_COPY: HomeCopy = {
  /** Shown after `Vid. ` — full line reads “Vid. …” + this text. */
  introText: "is an online platform for new music visuals.",
  lastSentenceText: "Music television for the streaming era.",
  ctaText: "REQUEST EARLY ACCESS",
};
