export enum LeadAssignmentSourceType {
  NewLeads = 1,
  BurnedLeads = 2,
}

export interface LeadAssignmentSetting {
  assignmentSourceType: LeadAssignmentSourceType;
  updatedAt?: string | null;
}

export interface LeadAssignmentSettingResult {
  isSuccess: boolean;
  message: string;
  data?: LeadAssignmentSetting;
}
