import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment";

/** Prevents browsers and intermediary proxies from serving stale API reads. */
export const apiNoCacheInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isReadRequest = request.method === "GET" || request.method === "HEAD";

  if (!isApiRequest || !isReadRequest) return next(request);

  return next(request.clone({
    setHeaders: {
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
    },
  }));
};
