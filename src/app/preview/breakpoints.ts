/** Used by /preview intro page for responsive film selection. */
export const PREVIEW_LANDING_DESKTOP_MIN_WIDTH = 1200;

export const PREVIEW_LANDING_MOBILE_MAX_WIDTH = PREVIEW_LANDING_DESKTOP_MIN_WIDTH - 1;

/** Landing block-2 video uses the original film ratio above this width. */
export const PREVIEW_LANDING_ORIGINAL_VIDEO_MIN_WIDTH = 971;

export const PREVIEW_LANDING_MOBILE_VIDEO_MAX_WIDTH = PREVIEW_LANDING_ORIGINAL_VIDEO_MIN_WIDTH - 1;

export const previewLandingDesktopMediaQuery = `(min-width: ${PREVIEW_LANDING_DESKTOP_MIN_WIDTH}px)`;

export const previewLandingMobileMediaQuery = `(max-width: ${PREVIEW_LANDING_MOBILE_MAX_WIDTH}px)`;

export const previewLandingOriginalVideoMediaQuery = `(min-width: ${PREVIEW_LANDING_ORIGINAL_VIDEO_MIN_WIDTH}px)`;

export const previewLandingMobileVideoMediaQuery = `(max-width: ${PREVIEW_LANDING_MOBILE_VIDEO_MAX_WIDTH}px)`;
