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

export interface ConsultantLeadAssignmentSetting {
  consultantProfileId: number;
  fullName: string;
  phoneNumber: string;
  isActive: boolean;
  isOnline: boolean;
  preferredLeadSourceType: LeadAssignmentSourceType | null;
  effectiveLeadSourceType: LeadAssignmentSourceType;
}

export interface ConsultantLeadAssignmentSettingResult {
  isSuccess: boolean;
  message: string;
  data?: ConsultantLeadAssignmentSetting;
}
