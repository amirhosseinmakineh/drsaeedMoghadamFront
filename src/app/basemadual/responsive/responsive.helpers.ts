import { BASE_BREAKPOINTS, BaseViewport } from "./breakpoints";

export function resolveBaseViewport(width: number): BaseViewport {
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
