import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../core/auth/auth.service";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

type NotebookAttendance = "pending" | "attended" | "absent";

interface NotebookReservation {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  attendance: NotebookAttendance;
  createdAt: string;
  createdByUserId: string;
  createdByDisplayName: string;
}

const NOTEBOOK_STORAGE_KEY = "secretary-reservation-notebook-v1";

@Component({
  selector: "app-secretary-reservation-notebook",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: "./secretary-reservation-notebook.component.html",
  styleUrl: "./secretary-reservation-notebook.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryReservationNotebookComponent implements OnInit {
  readonly reservations = signal<NotebookReservation[]>([]);
  readonly submitted = signal(false);
  readonly selectedSecretaryId = signal("");
  readonly editingReservationId = signal<string | null>(null);

  readonly secretaryOptions = computed(() => {
    const options = new Map<string, string>();
    for (const item of this.reservations()) {
      options.set(item.createdByUserId, item.createdByDisplayName);
    }
    return [...options.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "fa"));
  });

  readonly filteredReservations = computed(() => {
    const secretaryId = this.selectedSecretaryId();
    return secretaryId
      ? this.reservations().filter((item) => item.createdByUserId === secretaryId)
      : this.reservations();
  });

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ["", [Validators.required, Validators.maxLength(50)]],
    lastName: ["", [Validators.required, Validators.maxLength(50)]],
    date: ["", [Validators.required, Validators.pattern(/^[0-9۰-۹]{4}\/[0-9۰-۹]{1,2}\/[0-9۰-۹]{1,2}$/)]],
    time: ["", Validators.required],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.reservations.set(this.readReservations());
  }

  addReservation(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const editingId = this.editingReservationId();
    if (editingId) {
      this.updateReservations(
        this.reservations().map((item) =>
          item.id === editingId && this.canEdit(item)
            ? {
                ...item,
                firstName: value.firstName.trim(),
                lastName: value.lastName.trim(),
                date: value.date.trim(),
                time: value.time,
              }
            : item,
        ),
      );
    } else {
      const reservation: NotebookReservation = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        date: value.date.trim(),
        time: value.time,
        attendance: "pending",
        createdAt: new Date().toISOString(),
        createdByUserId: this.currentUserId(),
        createdByDisplayName: this.currentUserDisplayName(),
      };

      this.updateReservations([reservation, ...this.reservations()]);
    }

    this.cancelEdit();
  }

  editReservation(item: NotebookReservation): void {
    if (!this.canEdit(item)) return;
    this.editingReservationId.set(item.id);
    this.form.setValue({
      firstName: item.firstName,
      lastName: item.lastName,
      date: item.date,
      time: item.time,
    });
    globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  cancelEdit(): void {
    this.editingReservationId.set(null);
    this.form.reset({ firstName: "", lastName: "", date: "", time: "" });
    this.submitted.set(false);
  }

  canEdit(item: NotebookReservation): boolean {
    return item.createdByUserId === this.currentUserId();
  }

  setSecretaryFilter(value: string): void {
    this.selectedSecretaryId.set(value);
  }

  exportExcel(): void {
    const headers = ["نام", "نام خانوادگی", "تاریخ", "ساعت", "وضعیت حضور", "منشی"];
    const rows = this.filteredReservations().map((item) => [
      item.firstName,
      item.lastName,
      item.date,
      item.time,
      item.attendance === "attended" ? "آمد" : item.attendance === "absent" ? "نیامد" : "ثبت‌نشده",
      item.createdByDisplayName,
    ]);
    const escapeXml = (value: string) => value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
    const excelRows = [headers, ...rows]
      .map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`)
      .join("");
    const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="دفترچه رزروها"><Table>${excelRows}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><DisplayRightToLeft/></WorksheetOptions></Worksheet></Workbook>`;
    const url = URL.createObjectURL(new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `secretary-reservation-notebook-${new Date().toISOString().slice(0, 10)}.xls`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  setAttendance(id: string, attendance: NotebookAttendance): void {
    this.updateReservations(
      this.reservations().map((item) =>
        item.id === id ? { ...item, attendance } : item,
      ),
    );
  }

  deleteReservation(id: string): void {
    this.updateReservations(
      this.reservations().filter((item) => item.id !== id || !this.canEdit(item)),
    );
  }

  trackReservation(_: number, item: NotebookReservation): string {
    return item.id;
  }

  private updateReservations(reservations: NotebookReservation[]): void {
    this.reservations.set(reservations);
    try {
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(reservations));
    } catch {
      // The current page remains usable when browser storage is unavailable.
    }
  }

  private readReservations(): NotebookReservation[] {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTEBOOK_STORAGE_KEY) ?? "[]");
      if (!Array.isArray(stored)) return [];
      return stored
        .filter(
          (item) =>
          typeof item?.id === "string" &&
          typeof item?.firstName === "string" &&
          typeof item?.lastName === "string" &&
          typeof item?.date === "string" &&
          typeof item?.time === "string" &&
          ["pending", "attended", "absent"].includes(item?.attendance),
        )
        .map((item) => ({
          ...item,
          createdByUserId: typeof item.createdByUserId === "string" ? item.createdByUserId : this.currentUserId(),
          createdByDisplayName: typeof item.createdByDisplayName === "string" ? item.createdByDisplayName : this.currentUserDisplayName(),
        })) as NotebookReservation[];
    } catch {
      return [];
    }
  }

  private currentUserId(): string {
    return this.auth.user()?.userId || "current-secretary";
  }

  private currentUserDisplayName(): string {
    const user = this.auth.user();
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "منشی";
  }
}
