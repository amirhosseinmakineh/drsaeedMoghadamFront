export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export interface ConsultantDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isPresent: boolean;
  isOnline: boolean;
  totalScore: number;
}

export interface LeadDto {
  id: number;
  customerName: string;
  phoneNumber: string;
  leadStatus: string;
  assignmentDate: string;
  isConsultantOnline: boolean;
  hasCalled: boolean;
}

export interface AttendanceDto {
  id: number;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  description: string;
}

export interface ScoreCommand {
  consultantId: number;
  reason: 'ManagerReward' | 'ManagerPenalty';
  scoreValue: number;
  description: string;
}
