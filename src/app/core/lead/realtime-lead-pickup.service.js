 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpHeaders } from "@angular/common/http";

import { catchError, map, of } from "rxjs";

import { environment } from "../../../environments/environment";


 


























@Injectable({ providedIn: "root" })
export class RealtimeLeadPickupService {
    __init() {this.apiBaseUrl = environment.apiBaseUrl}

  constructor(
      http,
      auth,
  ) {;this.http = http;this.auth = auth;RealtimeLeadPickupService.prototype.__init.call(this);}

  canPickupLead(profileId) {
    return this.http
      .get(
        `${this.apiBaseUrl}/Consultant/CanPickupLead`,
        {
          headers: this.authHeaders(),
          params: { profileId },
        },
      )
      .pipe(
        map((response) => {
          const data = _nullishCoalesce(response.data, () => ( (response ).Data));
          return Boolean(_optionalChain([data, 'optionalAccess', _ => _.canPickup]));
        }),
        catchError(() => of(false)),
      );
  }

  pickupLead(
    leadAssignmentId,
    consultantProfileId,
  ) {
    return this.http
      .post(
        `${this.apiBaseUrl}/LeadAssignment/${leadAssignmentId}/pickup`,
        null,
        {
          headers: this.authHeaders(),
          params: { consultantProfileId },
        },
      )
      .pipe(
        map((response) => ({
          status: "success" ,
          message: _nullishCoalesce(response.message, () => ( "لید با موفقیت برداشته شد")),
          leadAssignmentId:
            _nullishCoalesce(_optionalChain([response, 'access', _2 => _2.data, 'optionalAccess', _3 => _3.leadAssignmentId]), () => (
            _optionalChain([(response ), 'access', _4 => _4.Data, 'optionalAccess', _5 => _5.leadAssignmentId]))),
          consultantProfileId:
            _nullishCoalesce(_optionalChain([response, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.consultantProfileId]), () => (
            _optionalChain([(response ), 'access', _8 => _8.Data, 'optionalAccess', _9 => _9.consultantProfileId]))),
          callDeadlineAt:
            _nullishCoalesce(_optionalChain([response, 'access', _10 => _10.data, 'optionalAccess', _11 => _11.callDeadlineAt]), () => (
            _optionalChain([(response ), 'access', _12 => _12.Data, 'optionalAccess', _13 => _13.callDeadlineAt]))),
        })),
        catchError((error) => of(this.mapPickupError(error))),
      );
  }

   mapPickupError(error) {
    const body = error.error ;
    const message =
      body && typeof body === "object"
        ? (_nullishCoalesce(body.message, () => ( "عملیات ناموفق بود")))
        : typeof body === "string" && body.trim()
          ? body
          : error.message;

    if (error.status === 429) {
      return { status: "dailyLimitReached", message };
    }

    if (error.status === 409) {
      return { status: "alreadyTaken", message };
    }

    if (error.status === 423) {
      return { status: "workloadBlocked", message };
    }

    return { status: "error", message };
  }

   authHeaders() {
    const token = this.auth.authToken();
    const baseHeaders = { Accept: "application/json" };
    if (token) baseHeaders["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(baseHeaders);
  }
}
