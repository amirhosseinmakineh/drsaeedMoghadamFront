export const BASE_BREAKPOINTS = {
  mobileMax: 639,
  tabletMin: 640,
  desktopMin: 1024,
  largeMin: 1440,
} as const;

export type BaseViewport = "mobile" | "tablet" | "desktop" | "large";
