/**
 * Digital representation of the clinic's paper patient intake form.
 * This type is not yet persisted. Do not claim successful intake storage
 * until the backend endpoint and EF migration are implemented.
 * The server alone assigns fileNumber via the existing locking algorithm.
 */
export interface PatientPaperIntake {
  birthDate?: string | null;
  maritalStatus?: string | null;
  educationLevel?: string | null;
  homePhone?: string | null;
  homeAddress?: string | null;
  workAddress?: string | null;
  referralSource?: string | null;
  medicalHistory: PatientPaperMedicalHistory;
  dentalNotes?: string | null;
  consentAccepted?: boolean | null;
  consentDate?: string | null;
  patientSignature?: string | null;
}

export interface PatientPaperMedicalHistory {
  heartDisease?: boolean | null;
  bloodPressure?: boolean | null;
  bleeding?: boolean | null;
  diabetes?: boolean | null;
  thyroid?: boolean | null;
  liverDisease?: boolean | null;
  respiratoryDisease?: boolean | null;
  kidneyDisease?: boolean | null;
  hepatitis?: boolean | null;
  malignancy?: boolean | null;
  infectiousDisease?: boolean | null;
  digestiveDisease?: boolean | null;
  allergy?: boolean | null;
  rheumatism?: boolean | null;
  epilepsy?: boolean | null;
  currentMedications?: string | null;
  hospitalizationHistory?: string | null;
  drugAllergies?: string | null;
  pregnancyOrBreastfeeding?: string | null;
  additionalMedicalNotes?: string | null;
}

export interface PatientPaperTreatmentRow {
  treatmentDate: string;
  description?: string | null;
  hasFollowUp: boolean;
  cost: number;
  paidAmount: number;
  /** Read-only: computed by the backend from cost and paidAmount. */
  remainingAmount: number;
  dentistName: string;
}

export interface PatientPaperRecord {
  intake: PatientPaperIntake;
  treatments: Omit<PatientPaperTreatmentRow, "remainingAmount">[];
  dentalChart: Record<string, unknown>;
}
