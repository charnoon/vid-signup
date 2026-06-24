export function getFeedSlideVisibilityRatio(
  slide: HTMLElement,
  scrollRoot: HTMLElement,
): number {
  const rootRect = scrollRoot.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  const visibleTop = Math.max(slideRect.top, rootRect.top);
  const visibleBottom = Math.min(slideRect.bottom, rootRect.bottom);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  if (slideRect.height <= 0) {
    return 0;
  }

  return visibleHeight / slideRect.height;
}

export function isFeedSlideMostlyVisible(
  slide: HTMLElement,
  scrollRoot: HTMLElement,
  threshold = 0.5,
): boolean {
  return getFeedSlideVisibilityRatio(slide, scrollRoot) >= threshold;
}

export function getMostVisibleFeedSlideIndex(
  slides: HTMLElement[],
  scrollRoot: HTMLElement,
): number {
  let bestIndex = 0;
  let bestRatio = -1;

  for (let index = 0; index < slides.length; index += 1) {
    const ratio = getFeedSlideVisibilityRatio(slides[index], scrollRoot);
    if (ratio > bestRatio) {
      bestIndex = index;
      bestRatio = ratio;
    }
  }

  return bestIndex;
}
