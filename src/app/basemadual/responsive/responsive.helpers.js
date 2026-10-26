import { BASE_BREAKPOINTS, } from "./breakpoints";

export function resolveBaseViewport(width) {
  if (width >= BASE_BREAKPOINTS.largeMin) {
    return "large";
  }

  if (width >= BASE_BREAKPOINTS.desktopMin) {
    return "desktop";
  }

  if (width >= BASE_BREAKPOINTS.tabletMin) {
    return "tablet";
  }

  return "mobile";
}
