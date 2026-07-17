import { DestroyRef } from "@angular/core";
import { ActivatedRoute, ParamMap, Router, NavigationStart } from "@angular/router";
import { filter } from "rxjs";

export function bindDashboardRouteHistory(
  router: Router,
  route: ActivatedRoute,
  applyRouteParams: (params: ParamMap) => void,
  destroyRef: DestroyRef,
): void {
  const subscription = router.events
    .pipe(filter((event) => event instanceof NavigationStart))
    .subscribe((event) => {
      const navigation = event as NavigationStart;
      if (navigation.navigationTrigger !== "popstate") return;
      applyRouteParams(route.snapshot.queryParamMap);
    });

  destroyRef.onDestroy(() => subscription.unsubscribe());
}
