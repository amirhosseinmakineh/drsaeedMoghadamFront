export interface AdminAccountingSummary {
  approvedSalesAmount: number;
  approvedSecretaryRewards: number;
  pendingSecretaryRewards: number;
  approvedConsultantRewards: number;
  pendingConsultantRewards: number;
  paidReferralRewards: number;
  pendingReferralRewards: number;
  pendingSecretarySalesCount: number;
  pendingConsultantRewardsCount: number;
  pendingReferralRewardsCount: number;
}

export interface AdminStaffAccountingRow {
  userId: string;
  fullName: string;
  role: "Secretary" | "Consultant";
  approvedItemsCount: number;
  pendingItemsCount: number;
  grossAmount: number;
  approvedRewardAmount: number;
  pendingRewardAmount: number;
  lastActivityAt?: string;
}

export interface AdminAccountingReport {
  summary: AdminAccountingSummary;
  staff: AdminStaffAccountingRow[];
}

export interface AdminAccountingFilters {
  fromDate?: string;
  toDate?: string;
  search?: string;
}
