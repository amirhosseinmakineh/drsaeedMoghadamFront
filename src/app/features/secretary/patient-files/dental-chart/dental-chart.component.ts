import { ChangeDetectionStrategy, Component, HostListener } from "@angular/core";

type ToothType = "molar" | "premolar" | "canine" | "central";
type ServiceId = "composite" | "implant" | "root" | "filling" | "laminate" | "scaling" | "extraction";

interface Tooth {
  id: number;
  number: number;
  jaw: "فک بالا" | "فک پایین";
  side: "R" | "L";
  outline: string;
  detail: string;
  transform: string;
  numberX: number;
  numberY: number;
}

interface ToothTreatment { service: ServiceId; description: string; }

const PATHS: Record<ToothType, { outline: string; detail: string }> = {
  molar: {
    outline: "M-20 -20 Q-26 -19 -28 -8 L-26 10 Q-25 23 -14 25 Q-4 28 1 24 Q12 28 20 23 Q27 18 26 7 L26 -9 Q25 -22 15 -23 Q5 -27 -1 -22 Q-11 -28 -20 -20 Z",
    detail: "M-16 -4 Q0 -8 16 -4 M0 -17 Q-3 0 1 19",
  },
  premolar: {
    outline: "M-15 -20 Q-23 -19 -23 -8 Q-23 4 -19 15 Q-15 27 0 27 Q15 27 19 15 Q23 4 23 -8 Q23 -19 15 -20 Q3 -26 -1 -21 Q-11 -26 -15 -20 Z",
    detail: "M-11 -1 Q0 6 11 1 M-1 -16 Q0 0 1 18",
  },
  canine: {
    outline: "M-12 -18 Q-16 -8 -18 9 Q-19 20 -10 24 L0 30 L10 24 Q19 20 18 9 Q16 -8 12 -18 Q3 -28 0 -30 Q-3 -28 -12 -18 Z",
    detail: "M-6 14 Q0 20 6 14",
  },
  central: {
    outline: "M-14 -24 Q-18 -17 -18 4 Q-18 22 -12 28 L12 28 Q18 22 18 4 Q18 -17 14 -24 Q0 -28 -14 -24 Z",
    detail: "M-11 -14 L11 -14 M-9 1 L9 1",
  },
};

const TYPES: ToothType[] = [
  "molar", "molar", "molar", "premolar", "premolar", "canine", "central", "central",
  "central", "central", "canine", "premolar", "premolar", "molar", "molar", "molar",
];
const DISPLAY_NUMBERS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 8];

function generateJaw(numbers: number[], upper: boolean): Tooth[] {
  return numbers.map((id, index) => {
    // Exactly the approved rounded-arch preview, including extra clearance for display numbers 5–8.
    const angle = Math.PI * index / 15;
    const x = 264 - 190 * Math.cos(angle);
    const y = upper ? 325 - 190 * Math.sin(angle) : 431 + 190 * Math.sin(angle);
    const numberX = 264 - 237 * Math.cos(angle);
    const numberY = upper ? 325 - 236 * Math.sin(angle) : 431 + 236 * Math.sin(angle);
    const rotation = upper ? 90 - 180 * index / 15 : -90 + 180 * index / 15;
    const type = TYPES[index];
    let scale = type === "molar" ? 1 : type === "premolar" ? .78 : type === "canine" ? .66 : .70;
    if (DISPLAY_NUMBERS[index] >= 5 && DISPLAY_NUMBERS[index] <= 8) scale *= .78;
    const path = PATHS[type];
    return {
      id, number: DISPLAY_NUMBERS[index], jaw: upper ? "فک بالا" : "فک پایین",
      side: index < 8 ? "R" : "L",
      outline: path.outline, detail: path.detail,
      transform: "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ") rotate(" +
        rotation.toFixed(2) + ") scale(" + scale + " " + scale + ")",
      numberX, numberY,
    };
  });
}

@Component({
  selector: "app-secretary-dental-chart",
  standalone: true,
  templateUrl: "./dental-chart.component.html",
  styleUrl: "./dental-chart.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryDentalChartComponent {
  readonly services: { id: ServiceId; label: string; fill: string; stroke: string }[] = [
    { id: "composite", label: "کامپوزیت", fill: "#dcefff", stroke: "#087fc1" },
    { id: "implant", label: "ایمپلنت", fill: "#ffe0e1", stroke: "#e13f4b" },
    { id: "root", label: "عصب‌کشی", fill: "#fff0c9", stroke: "#d49128" },
    { id: "filling", label: "ترمیم", fill: "#d9f5e8", stroke: "#38a478" },
    { id: "laminate", label: "لمینت", fill: "#eadfff", stroke: "#9165c4" },
    { id: "scaling", label: "جرم‌گیری", fill: "#d8f5f5", stroke: "#339b9a" },
    { id: "extraction", label: "کشیدن", fill: "#e7ebed", stroke: "#7c858c" },
  ];

  readonly teeth: Tooth[] = [
    ...generateJaw([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], true),
    ...generateJaw([32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17], false),
  ];

  treatments: Record<number, ToothTreatment> = {};
  selectedTooth: Tooth | null = null;
  draftService = "";
  draftDescription = "";
  validationError = "";

  get treatmentCount(): number { return Object.keys(this.treatments).length; }

  get savedTreatments(): { tooth: Tooth; service: ServiceId; description: string }[] {
    return this.teeth.filter(tooth => !!this.treatments[tooth.id]).map(tooth => ({
      tooth, ...this.treatments[tooth.id],
    }));
  }

  toothLabel(tooth: Tooth): string {
    return "دندان " + tooth.number + " · " + tooth.jaw + " · " + tooth.side;
  }

  serviceLabel(id: ServiceId): string {
    return this.services.find(service => service.id === id)?.label ?? id;
  }

  fillFor(id: number): string | null {
    const selected = this.treatments[id];
    return selected ? this.services.find(service => service.id === selected.service)?.fill ?? null : null;
  }

  strokeFor(id: number): string | null {
    const selected = this.treatments[id];
    return selected ? this.services.find(service => service.id === selected.service)?.stroke ?? null : null;
  }

  select(tooth: Tooth): void {
    this.selectedTooth = tooth;
    this.draftService = this.treatments[tooth.id]?.service ?? "";
    this.draftDescription = this.treatments[tooth.id]?.description ?? "";
    this.validationError = "";
  }

  changeService(event: Event): void {
    this.draftService = (event.target as HTMLSelectElement).value;
    this.validationError = "";
  }

  changeDescription(event: Event): void {
    this.draftDescription = (event.target as HTMLTextAreaElement).value;
  }

  save(): void {
    if (!this.selectedTooth) return;
    const service = this.services.find(item => item.id === this.draftService);
    if (!service) {
      this.validationError = "لطفاً یک خدمت انتخاب کنید.";
      return;
    }
    this.treatments = {
      ...this.treatments,
      [this.selectedTooth.id]: { service: service.id, description: this.draftDescription.trim() },
    };
    this.closeEditor();
  }

  remove(): void {
    if (!this.selectedTooth) return;
    const { [this.selectedTooth.id]: removed, ...remaining } = this.treatments;
    this.treatments = remaining;
    this.closeEditor();
  }

  closeEditor(): void {
    this.selectedTooth = null;
    this.validationError = "";
  }
}