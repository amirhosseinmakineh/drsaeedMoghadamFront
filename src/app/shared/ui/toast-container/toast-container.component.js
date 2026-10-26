 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";







const DEFAULT_TOAST_AUTO_DISMISS_MS = 2000;

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toast-container.component.html",
  styleUrl: "./toast-container.component.scss",
})
export class ToastContainerComponent  {
  __init() {this.toasts = []}
   __init2() {this.subscription = null}
   __init3() {this.timers = new Map()}

  constructor( toastService) {;this.toastService = toastService;ToastContainerComponent.prototype.__init.call(this);ToastContainerComponent.prototype.__init2.call(this);ToastContainerComponent.prototype.__init3.call(this);}

  ngOnInit() {
    this.subscription = this.toastService.messages$.subscribe((toast) => {
      this.toasts = [...this.toasts, toast];
      const autoDismissMs =
        toast.autoDismissMs === undefined
          ? DEFAULT_TOAST_AUTO_DISMISS_MS
          : toast.autoDismissMs;
      if (autoDismissMs === null) return;

      const timer = setTimeout(() => this.dismiss(toast.id), autoDismissMs);
      this.timers.set(toast.id, timer);
    });
  }

  ngOnDestroy() {
    _optionalChain([this, 'access', _ => _.subscription, 'optionalAccess', _2 => _2.unsubscribe, 'call', _3 => _3()]);
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  runAction(toast) {
    _optionalChain([toast, 'access', _4 => _4.action, 'optionalAccess', _5 => _5.handler, 'call', _6 => _6()]);
    this.dismiss(toast.id);
  }

  dismiss(id) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
