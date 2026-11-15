import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PatientDocumentsManagerComponent } from "../../shared/patient-finance/patient-documents-manager.component";
import { AdminInstallmentsComponent } from "./admin-installments.component";
import { AdminDueChequesComponent } from "./admin-due-cheques.component";

type DocumentsView = "management" | "cheques" | "notes" | "installments";

@Component({
  selector: "app-admin-financial-documents",
  standalone: true,
  imports: [PatientDocumentsManagerComponent, AdminDueChequesComponent, AdminInstallmentsComponent],
  templateUrl: "./admin-financial-documents.component.html",
  styleUrl: "./admin-financial-documents.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFinancialDocumentsComponent {
  view: DocumentsView = "management";
  readonly views: { id: DocumentsView; label: string }[] = [
    { id: "management", label: "مدیریت اسناد" },
    { id: "cheques", label: "سررسید چک‌ها" },
    { id: "notes", label: "سررسید سفته‌ها" },
    { id: "installments", label: "جدول اقساط" },
  ];
}
