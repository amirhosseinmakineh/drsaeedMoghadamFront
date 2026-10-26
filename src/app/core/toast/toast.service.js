
import { Subject } from "rxjs";

 














@Injectable({ providedIn: "root" })
export class ToastService {constructor() { ToastService.prototype.__init.call(this);ToastService.prototype.__init2.call(this);ToastService.prototype.__init3.call(this); }
   __init() {this.nextId = 0}
    __init2() {this.messagesSubject = new Subject()}
   __init3() {this.messages$ = this.messagesSubject.asObservable()}

  success(message) {
    this.show(message, "success");
  }

  error(message) {
    this.show(message, "error");
  }

  info(message) {
    this.show(message, "info");
  }

  action(
    message,
    action,
    type = "info",
    autoDismissMs = null,
  ) {
    this.emit(message, type, action, autoDismissMs);
  }

  show(message, type = "info") {
    this.emit(message, type);
  }

   emit(
    message,
    type,
    action,
    autoDismissMs = 2000,
  ) {
    const trimmed = message.trim();
    if (!trimmed) return;

    this.messagesSubject.next({
      id: ++this.nextId,
      message: trimmed,
      type,
      action,
      autoDismissMs,
    });
  }
}
