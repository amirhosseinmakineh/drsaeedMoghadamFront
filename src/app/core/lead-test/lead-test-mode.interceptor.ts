import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from "@angular/common/http";
import { of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  LEAD_TEST_BROADCAST_LEADS,
  findLeadTestBroadcastLead,
  isLeadTestConsultantOnline,
  isLeadTestModeUser,
  setLeadTestConsultantOnline,
} from "./lead-test-mode";

function matchesPath(url: string, segment: string): boolean {
  return url.includes(segment);
}

function readJsonBody<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null;
  return body as T;
}

function paginated<T>(items: T[]) {
  return {
    items,
    totalCount: items.length,
    pageNumber: 1,
    pageSize: Math.max(items.length, 1),
    totalPages: items.length ? 1 : 0,
  };
}

export const leadTestModeInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isLeadTestModeUser()) {
    return next(req);
  }

  const url = req.url;

  if (matchesPath(url, "/Consultant/SetOnlineOfflineConsultant")) {
    const payload = readJsonBody<{ isOnline?: boolean }>(req.body);
    setLeadTestConsultantOnline(Boolean(payload?.isOnline));

    return next(req).pipe(
      catchError(() =>
        of(
          new HttpResponse({
            status: 200,
            body: {
              isSuccess: true,
              message: "حالت تست: وضعیت آنلاین ثبت شد.",
              data: {
                isOnline: Boolean(payload?.isOnline),
                isAvailable: true,
                canGoOnline: true,
                pendingOfflineLeadCount: 0,
                onlineStatusBlockReason: null,
              },
            },
          }),
        ),
      ),
      map((event) => {
        if (!(event instanceof HttpResponse) || !event.body) return event;

        const body = event.body as Record<string, unknown>;
        const data =
          body["data"] && typeof body["data"] === "object"
            ? ({ ...(body["data"] as object) } as Record<string, unknown>)
            : ({} as Record<string, unknown>);

        data["isOnline"] = Boolean(payload?.isOnline);
        data["isAvailable"] = true;
        data["canGoOnline"] = true;
        data["pendingOfflineLeadCount"] = 0;
        data["onlineStatusBlockReason"] = null;

        return event.clone({
          body: {
            ...body,
            isSuccess: true,
            message: body["message"] || "حالت تست: وضعیت آنلاین ثبت شد.",
            data,
          },
        });
      }),
    );
  }

  if (matchesPath(url, "/Consultant/SetAvalableConsultant")) {
    const payload = readJsonBody<{ isAvailable?: boolean }>(req.body);

    return next(req).pipe(
      catchError(() =>
        of(
          new HttpResponse({
            status: 200,
            body: {
              isSuccess: true,
              message: "حالت تست: حضور ثبت شد.",
              data: {
                isAvailable: Boolean(payload?.isAvailable),
                canGoOnline: true,
                pendingOfflineLeadCount: 0,
                onlineStatusBlockReason: null,
              },
            },
          }),
        ),
      ),
    );
  }

  if (matchesPath(url, "/Consultant/GetDashboardStatus")) {
    return next(req).pipe(
      catchError(() =>
        of(
          new HttpResponse({
            status: 200,
            body: {
              profileId: Number(new URL(url).searchParams.get("profileId")) || 0,
              isAvailable: true,
              isOnline: isLeadTestConsultantOnline(),
              lastOnlineAt: null,
              lastOfflineAt: null,
              pendingOfflineLeadCount: 0,
              currentScore: 0,
              canGoOnline: true,
              onlineStatusBlockReason: null,
            },
          }),
        ),
      ),
      map((event) => {
        if (!(event instanceof HttpResponse) || !event.body) return event;

        const body = event.body as Record<string, unknown>;
        return event.clone({
          body: {
            ...body,
            isAvailable: true,
            isOnline:
              typeof body["isOnline"] === "boolean"
                ? body["isOnline"]
                : isLeadTestConsultantOnline(),
            pendingOfflineLeadCount: 0,
            canGoOnline: true,
            onlineStatusBlockReason: null,
          },
        });
      }),
    );
  }

  if (
    matchesPath(url, "/Consultant/GetBroadcastingLeads") &&
    isLeadTestConsultantOnline()
  ) {
    return of(
      new HttpResponse({
        status: 200,
        body: paginated(LEAD_TEST_BROADCAST_LEADS),
      }),
    );
  }

  if (matchesPath(url, "/Consultant/AcceptLead")) {
    const payload = readJsonBody<{
      leadAssignmentId?: number;
      consultantProfileId?: number;
    }>(req.body);
    const lead = findLeadTestBroadcastLead(Number(payload?.leadAssignmentId));

    if (lead) {
      return of(
        new HttpResponse({
          status: 200,
          body: {
            isSuccess: true,
            message: "حالت تست: لید با موفقیت پذیرفته شد.",
            data: {
              leadAssignmentId: lead.leadAssignmentId,
              consultantProfileId: Number(payload?.consultantProfileId) || 0,
              leadAssignmentState: 9,
              phoneNumber: lead.phoneNumber,
              firstName: lead.firstName,
              lastName: lead.lastName,
              fullName: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
            },
          },
        }),
      );
    }
  }

  if (matchesPath(url, "/Consultant/RejectBroadcast")) {
    const payload = readJsonBody<{ leadAssignmentId?: number }>(req.body);
    const lead = findLeadTestBroadcastLead(Number(payload?.leadAssignmentId));

    if (lead) {
      return of(
        new HttpResponse({
          status: 200,
          body: {
            isSuccess: true,
            message: "حالت تست: لید رد شد.",
          },
        }),
      );
    }
  }

  if (matchesPath(url, "/Consultant/GetLeads")) {
    return next(req).pipe(
      map((event) => {
        if (!(event instanceof HttpResponse) || !event.body) return event;

        const params = new URL(url).searchParams;
        const leadType = Number(params.get("leadAssignmentType"));
        const leadState = Number(params.get("leadAssignmentState"));
        const isRealtimeQuery =
          !Number.isFinite(leadType) ||
          leadType === 1 ||
          params.get("leadAssignmentType") === null;
        const isBroadcastQuery =
          leadState === 8 || params.get("leadAssignmentState") === "8";

        if (!isLeadTestConsultantOnline() || !isRealtimeQuery || isBroadcastQuery) {
          return event;
        }

        const body = event.body as {
          items?: unknown[];
          totalCount?: number;
          pageNumber?: number;
          pageSize?: number;
          totalPages?: number;
        };

        const claimed = (body.items ?? []).filter((item) => {
          const record = item as Record<string, unknown>;
          const state = Number(
            record["leadAssignmentState"] ?? record["LeadAssignmentState"],
          );
          return state === 9;
        });

        const synthetic = LEAD_TEST_BROADCAST_LEADS.map((lead) => ({
          leadAssignmentId: lead.leadAssignmentId,
          userName: lead.firstName,
          phoneNumber: lead.phoneNumber,
          leadAssignmentState: 8,
          leadAssignmentType: 1,
          hasActiveReservation: false,
          assignedAt: lead.broadcastStartedAt,
          callDeadlineAt: null,
          requiresThreeMinuteCall: false,
          id: lead.leadAssignmentId,
        }));

        const merged = [...synthetic, ...claimed];
        return event.clone({
          body: {
            ...body,
            items: merged,
            totalCount: Math.max(body.totalCount ?? 0, merged.length),
            totalPages: 1,
          },
        });
      }),
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 500 && matchesPath(url, "/Consultant/")) {
        return of(
          new HttpResponse({
            status: 200,
            body: {
              isSuccess: true,
              message: "حالت تست: پاسخ جایگزین برای خطای سرور.",
            },
          }),
        );
      }

      throw error;
    }),
  );
};
