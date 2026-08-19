import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
import { ReservationSyncService } from "./reservation-sync.service";

interface SignalRNegotiateResponse {
  connectionToken?: string;
  connectionId?: string;
}

interface SignalRMessage {
  type?: number;
  target?: string;
}

const RECORD_SEPARATOR = "\u001e";

/** Keeps reservation lists current without coupling dashboard components to SignalR. */
@Injectable({ providedIn: "root" })
export class ReservationsRealtimeService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private started = false;
  private disposed = false;

  constructor(
    private readonly auth: AuthService,
    private readonly reservationSync: ReservationSyncService,
  ) {}

  start(): void {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    void this.connect();
  }

  ngOnDestroy(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }

  private async connect(): Promise<void> {
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
      const negotiation = (await response.json()) as SignalRNegotiateResponse;
      const connectionToken = negotiation.connectionToken ?? negotiation.connectionId;
      if (!connectionToken) throw new Error("SignalR connection token was not returned");

      const websocketUrl = new URL(hubUrl, window.location.origin);
      websocketUrl.protocol = websocketUrl.protocol === "https:" ? "wss:" : "ws:";
      websocketUrl.searchParams.set("id", connectionToken);
      websocketUrl.searchParams.set("access_token", token);
      this.openSocket(websocketUrl.toString());
    } catch (error) {
      console.warn("Reservations realtime connection failed", error);
      this.scheduleReconnect();
    }
  }

  private openSocket(url: string): void {
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

  private handleMessages(payload: string): void {
    for (const frame of payload.split(RECORD_SEPARATOR)) {
      if (!frame.trim()) continue;
      try {
        const message = JSON.parse(frame) as SignalRMessage;
        if (message.type === 1 && message.target === "ReservationUpdated") {
          // A refetch is intentional: a time change can move an item across the
          // current date range and can also alter ordering and dashboard totals.
          this.reservationSync.requestRefresh();
        }
      } catch {
        console.warn("Invalid reservations SignalR message received");
      }
    }
  }

  private scheduleReconnect(): void {
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
