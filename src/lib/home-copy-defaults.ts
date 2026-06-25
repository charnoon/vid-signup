/** Homepage headline / CTA strings (hardcoded; edit here to change the landing copy). */
export type HomeCopy = {
  /** Text after "Vid. " in the headline */
  headlineText: string;
  ctaText: string;
};

export const DEFAULT_HOME_COPY: HomeCopy = {
  headlineText: "A platform for new music visuals.",
  ctaText: "REQUEST EARLY ACCESS",
};
