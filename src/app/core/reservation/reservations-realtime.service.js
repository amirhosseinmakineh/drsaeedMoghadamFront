 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { environment } from "../../../environments/environment";












const RECORD_SEPARATOR = "\u001e";

/** Keeps reservation lists current without coupling dashboard components to SignalR. */
@Injectable({ providedIn: "root" })
export class ReservationsRealtimeService  {
   __init() {this.socket = null}
   __init2() {this.reconnectTimer = null}
   __init3() {this.reconnectAttempt = 0}
   __init4() {this.started = false}
   __init5() {this.disposed = false}

  constructor(
      auth,
      reservationSync,
  ) {;this.auth = auth;this.reservationSync = reservationSync;ReservationsRealtimeService.prototype.__init.call(this);ReservationsRealtimeService.prototype.__init2.call(this);ReservationsRealtimeService.prototype.__init3.call(this);ReservationsRealtimeService.prototype.__init4.call(this);ReservationsRealtimeService.prototype.__init5.call(this);}

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    void this.connect();
  }

  ngOnDestroy() {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    _optionalChain([this, 'access', _ => _.socket, 'optionalAccess', _2 => _2.close, 'call', _3 => _3()]);
  }

   async connect() {
    const token = this.auth.authToken();
    if (!token || this.disposed) {
      this.scheduleReconnect();
      return;
    }

    try {
      const hubUrl = `${environment.apiBaseUrl.replace(/\/api\/?$/, "")}/hubs/reservations`;
      const response = await fetch(`${hubUrl}/negotiate?negotiateVersion=1`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`SignalR negotiate failed (${response.status})`);
      const negotiation = (await response.json()) ;
      const connectionToken = _nullishCoalesce(negotiation.connectionToken, () => ( negotiation.connectionId));
      if (!connectionToken) throw new Error("SignalR connection token was not returned");

      const websocketUrl = new URL(hubUrl);
      websocketUrl.protocol = websocketUrl.protocol === "https:" ? "wss:" : "ws:";
      websocketUrl.searchParams.set("id", connectionToken);
      websocketUrl.searchParams.set("access_token", token);
      this.openSocket(websocketUrl.toString());
    } catch (error) {
      console.warn("Reservations realtime connection failed", error);
      this.scheduleReconnect();
    }
  }

   openSocket(url) {
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.onopen = () => {
      socket.send(`{"protocol":"json","version":1}${RECORD_SEPARATOR}`);
      if (this.reconnectAttempt > 0) this.reservationSync.requestRefresh();
      this.reconnectAttempt = 0;
    };
    socket.onmessage = (event) => this.handleMessages(String(event.data));
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      this.scheduleReconnect();
    };
  }

   handleMessages(payload) {
    for (const frame of payload.split(RECORD_SEPARATOR)) {
      if (!frame.trim()) continue;
      try {
        const message = JSON.parse(frame) ;
        if (message.type === 1 && message.target === "ReservationUpdated") {
          // A refetch is intentional: a time change can move an item across the
          // current date range and can also alter ordering and dashboard totals.
          this.reservationSync.requestRefresh();
        }
      } catch (e) {
        console.warn("Invalid reservations SignalR message received");
      }
    }
  }

   scheduleReconnect() {
    if (this.disposed || this.reconnectTimer) return;
    const delays = [0, 2000, 5000, 10000];
    const delay = delays[Math.min(this.reconnectAttempt, delays.length - 1)];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, delay);
  }
}
