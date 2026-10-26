import { CommonModule } from "@angular/common";


@Component({
  selector: "app-loading",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./loading.component.html"
})
export class LoadingComponent {constructor() { LoadingComponent.prototype.__init.call(this);LoadingComponent.prototype.__init2.call(this); }
  Input() __init() {this.loading = false}
  Input() __init2() {this.label = "Loading"}
}
