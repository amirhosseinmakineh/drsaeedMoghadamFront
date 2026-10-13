import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, firstValueFrom } from "rxjs";
import {
  PatientAdditionalDocument,
  PatientFinancialCaseId,
} from "../../models/patient-finance.models";
import { PatientFinanceApiService } from "../../services/patient-finance-api.service";

interface DocumentPreview {
  document: PatientAdditionalDocument;
  imageUrl: string | null;
}

@Component({
  selector: "app-patient-additional-documents",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./patient-additional-documents.component.html",
  styleUrl: "./patient-additional-documents.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientAdditionalDocumentsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) caseId!: PatientFinancialCaseId;

  readonly maximumImageSize = 5 * 1024 * 1024;
  readonly maximumDocumentCount = 20;

  documents: DocumentPreview[] = [];
  loading = false;
  uploading = false;
  removingId: string | null = null;
  error = "";
  description = "";

  private readonly destroyRef = inject(DestroyRef);
  private readonly imageUrls = new Set<string>();

  constructor(
    private readonly api: PatientFinanceApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    for (const url of this.imageUrls) {
      URL.revokeObjectURL(url);
    }

    this.imageUrls.clear();
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = "";

    this.api.getAdditionalDocuments(this.caseId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (documents) => {
          this.releaseImageUrls();
          this.documents = documents.map((document) => ({
            document,
            imageUrl: null,
          }));

          for (const preview of this.documents) {
            this.loadImage(preview);
          }

          this.cdr.markForCheck();
        },
        error: () => {
          this.error = "دریافت مدارک اضافی انجام نشد.";
          this.cdr.markForCheck();
        },
      });
  }

  private loadImage(preview: DocumentPreview): void {
    this.api.getAdditionalDocumentImage(this.caseId, preview.document.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const imageUrl = URL.createObjectURL(blob);
          this.imageUrls.add(imageUrl);
          preview.imageUrl = imageUrl;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = "نمایش برخی تصاویر امکان‌پذیر نیست.";
          this.cdr.markForCheck();
        },
      });
  }

  async selectImages(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";

    if (this.uploading || !files.length) {
      return;
    }

    if (files.length + this.documents.length > this.maximumDocumentCount) {
      this.error = "حداکثر ۲۰ تصویر برای هر پرونده مجاز است.";
      return;
    }

    for (const file of files) {
      if (
        !["image/jpeg", "image/png"].includes(file.type) ||
        file.size === 0 ||
        file.size > this.maximumImageSize
      ) {
        this.error = "هر تصویر باید JPG یا PNG و حداکثر ۵ مگابایت باشد.";
        return;
      }
    }

    this.uploading = true;
    this.error = "";

    try {
      for (const file of files) {
        const result = await firstValueFrom(
          this.api.uploadAdditionalDocument(
            this.caseId,
            file,
            this.description.trim(),
          ),
        );

        if (!result.isSuccess) {
          throw new Error(result.message || "آپلود تصویر انجام نشد.");
        }
      }

      this.description = "";
      this.loadDocuments();
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : "آپلود تصویر انجام نشد.";

      // A previous image may have uploaded successfully.
      this.loadDocuments();
    } finally {
      this.uploading = false;
      this.cdr.markForCheck();
    }
  }

  removeDocument(document: PatientAdditionalDocument): void {
    if (
      this.removingId !== null ||
      !confirm("تصویر انتخاب‌شده از پرونده حذف شود؟")
    ) {
      return;
    }

    this.removingId = document.id;
    this.error = "";

    this.api.deleteAdditionalDocument(this.caseId, document.id)
      .pipe(
        finalize(() => {
          this.removingId = null;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.loadDocuments();
          } else {
            this.error = result.message || "حذف مدرک انجام نشد.";
          }
        },
        error: () => {
          this.error = "حذف مدرک انجام نشد.";
          this.cdr.markForCheck();
        },
      });
  }

  private releaseImageUrls(): void {
    for (const url of this.imageUrls) {
      URL.revokeObjectURL(url);
    }

    this.imageUrls.clear();
  }
}
