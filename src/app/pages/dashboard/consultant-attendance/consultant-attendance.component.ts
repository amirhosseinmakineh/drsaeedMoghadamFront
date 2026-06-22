import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmptyStateComponent, TableColumn, TableComponent } from '../../../shared/base';
import { AttendanceDto } from '../../../models/admin-dashboard.model';
import { ConsultantService } from '../consultant-management/consultant.service';

@Component({
  selector: 'app-consultant-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, TableComponent, EmptyStateComponent],
  templateUrl: './consultant-attendance.component.html',
  styleUrl: './consultant-attendance.component.scss'
})
export class ConsultantAttendanceComponent {
  consultantId = Number(this.route.snapshot.paramMap.get('consultantId'));
  attendanceItems: AttendanceDto[] = this.consultantService.getConsultantAttendance(this.consultantId);

  columns: TableColumn<AttendanceDto>[] = [
    { key: 'attendanceDate', label: 'Attendance Date' },
    { key: 'checkInTime', label: 'Check In Time' },
    { key: 'checkOutTime', label: 'Check Out Time' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' }
  ];

  constructor(private route: ActivatedRoute, private consultantService: ConsultantService) {}
}
