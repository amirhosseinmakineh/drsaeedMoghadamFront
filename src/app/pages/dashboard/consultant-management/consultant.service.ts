import { Injectable } from '@angular/core';
import { AttendanceDto, ConsultantDto, LeadDto, ScoreCommand } from '../../../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private consultants: ConsultantDto[] = [
    { id: 1, firstName: 'نیما', lastName: 'رحیمی', phoneNumber: '09123330001', isPresent: true, isOnline: true, totalScore: 18 },
    { id: 2, firstName: 'لیلا', lastName: 'شیرازی', phoneNumber: '09123330002', isPresent: true, isOnline: false, totalScore: 12 },
    { id: 3, firstName: 'رضا', lastName: 'نوری', phoneNumber: '09123330003', isPresent: false, isOnline: false, totalScore: 7 }
  ];

  private leads: Record<number, LeadDto[]> = {
    1: [
      { id: 1, customerName: 'مریم حسنی', phoneNumber: '09124440001', leadStatus: 'جدید', assignmentDate: '2026-06-10', isConsultantOnline: true, hasCalled: false },
      { id: 2, customerName: 'امید جعفری', phoneNumber: '09124440002', leadStatus: 'پیگیری', assignmentDate: '2026-06-11', isConsultantOnline: true, hasCalled: true }
    ],
    2: [
      { id: 3, customerName: 'پریسا صادقی', phoneNumber: '09124440003', leadStatus: 'علاقه‌مند', assignmentDate: '2026-06-12', isConsultantOnline: false, hasCalled: true }
    ],
    3: []
  };

  private attendance: Record<number, AttendanceDto[]> = {
    1: [
      { id: 1, attendanceDate: '2026-06-17', checkInTime: '09:00', checkOutTime: '17:00', status: 'حاضر', description: 'روز کامل' },
      { id: 2, attendanceDate: '2026-06-18', checkInTime: '09:15', checkOutTime: '17:00', status: 'تاخیر', description: 'تاخیر به دلیل ترافیک' }
    ],
    2: [
      { id: 3, attendanceDate: '2026-06-17', checkInTime: '08:55', checkOutTime: '16:45', status: 'حاضر', description: 'روز کامل' }
    ],
    3: [
      { id: 4, attendanceDate: '2026-06-17', checkInTime: '-', checkOutTime: '-', status: 'غایب', description: 'ورود ثبت نشده' }
    ]
  };

  getConsultants(): ConsultantDto[] {
    return [...this.consultants];
  }

  getConsultantLeads(consultantId: number): LeadDto[] {
    return [...(this.leads[consultantId] ?? [])];
  }

  getConsultantAttendance(consultantId: number): AttendanceDto[] {
    return [...(this.attendance[consultantId] ?? [])];
  }

  submitScore(command: ScoreCommand): void {
    this.consultants = this.consultants.map(consultant => {
      if (consultant.id !== command.consultantId) return consultant;
      const change = command.reason === 'ManagerReward' ? command.scoreValue : -command.scoreValue;
      return { ...consultant, totalScore: consultant.totalScore + change };
    });
  }
}
