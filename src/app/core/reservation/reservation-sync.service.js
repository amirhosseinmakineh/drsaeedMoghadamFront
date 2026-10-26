 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Subject, debounceTime, share } from "rxjs";

@Injectable({ providedIn: "root" })
export class ReservationSyncService  {
   static  __initStatic() {this.channelName = "reservation-updates"}
    __init() {this.refreshSubject = new Subject()}
    __init2() {this.channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(ReservationSyncService.channelName)}

   __init3() {this.refreshRequested$ = this.refreshSubject.pipe(
    debounceTime(600),
    share(),
  )}

  constructor() {;ReservationSyncService.prototype.__init.call(this);ReservationSyncService.prototype.__init2.call(this);ReservationSyncService.prototype.__init3.call(this);
    if (this.channel) {
      this.channel.onmessage = () => this.refreshSubject.next();
    }
  }

  requestRefresh() {
    this.refreshSubject.next();
    _optionalChain([this, 'access', _ => _.channel, 'optionalAccess', _2 => _2.postMessage, 'call', _3 => _3("refresh")]);
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _4 => _4.channel, 'optionalAccess', _5 => _5.close, 'call', _6 => _6()]);
    this.refreshSubject.complete();
  }
} ReservationSyncService.__initStatic();
