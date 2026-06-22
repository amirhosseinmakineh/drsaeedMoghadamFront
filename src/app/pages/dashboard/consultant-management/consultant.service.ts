import { Injectable } from '@angular/core';
import { AttendanceDto, ConsultantDto, LeadDto, ScoreCommand } from '../../../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class ConsultantService {
  private consultants: ConsultantDto[] = [
    { id: 1, firstName: 'Nima', lastName: 'Rahimi', phoneNumber: '09123330001', isPresent: true, isOnline: true, totalScore: 18 },
    { id: 2, firstName: 'Leila', lastName: 'Shirazi', phoneNumber: '09123330002', isPresent: true, isOnline: false, totalScore: 12 },
    { id: 3, firstName: 'Reza', lastName: 'Nouri', phoneNumber: '09123330003', isPresent: false, isOnline: false, totalScore: 7 }
  ];

  private leads: Record<number, LeadDto[]> = {
    1: [
      { id: 1, customerName: 'Maryam Hasani', phoneNumber: '09124440001', leadStatus: 'New', assignmentDate: '2026-06-10', isConsultantOnline: true, hasCalled: false },
      { id: 2, customerName: 'Omid Jafari', phoneNumber: '09124440002', leadStatus: 'Follow Up', assignmentDate: '2026-06-11', isConsultantOnline: true, hasCalled: true }
    ],
    2: [
      { id: 3, customerName: 'Parisa Sadeghi', phoneNumber: '09124440003', leadStatus: 'Interested', assignmentDate: '2026-06-12', isConsultantOnline: false, hasCalled: true }
    ],
    3: []
  };

  private attendance: Record<number, AttendanceDto[]> = {
    1: [
      { id: 1, attendanceDate: '2026-06-17', checkInTime: '09:00', checkOutTime: '17:00', status: 'Present', description: 'Full day' },
      { id: 2, attendanceDate: '2026-06-18', checkInTime: '09:15', checkOutTime: '17:00', status: 'Late', description: 'Traffic delay' }
    ],
    2: [
      { id: 3, attendanceDate: '2026-06-17', checkInTime: '08:55', checkOutTime: '16:45', status: 'Present', description: 'Full day' }
    ],
    3: [
      { id: 4, attendanceDate: '2026-06-17', checkInTime: '-', checkOutTime: '-', status: 'Absent', description: 'No check in' }
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
