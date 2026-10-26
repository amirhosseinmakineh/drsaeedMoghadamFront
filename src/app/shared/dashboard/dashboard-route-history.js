
import { NavigationStart } from "@angular/router";
import { filter } from "rxjs";

export function bindDashboardRouteHistory(
  router,
  route,
  applyRouteParams,
  destroyRef,
) {
  const subscription = router.events
    .pipe(filter((event) => event instanceof NavigationStart))
    .subscribe((event) => {
      const navigation = event ;
      if (navigation.navigationTrigger !== "popstate") return;
      applyRouteParams(route.snapshot.queryParamMap);
    });

  destroyRef.onDestroy(() => subscription.unsubscribe());
}
