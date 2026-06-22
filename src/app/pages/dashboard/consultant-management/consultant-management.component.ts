import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseDialogComponent, TableAction, TableActionClick, TableColumn, TableComponent } from '../../../shared/base';
import { ToastService } from '../../../services/toast.service';
import { ConsultantDto, ScoreCommand } from '../../../models/admin-dashboard.model';
import { ConsultantService } from './consultant.service';

@Component({
  selector: 'app-consultant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, BaseDialogComponent],
  templateUrl: './consultant-management.component.html',
  styleUrl: './consultant-management.component.scss'
})
export class ConsultantManagementComponent {
  consultants: ConsultantDto[] = [];
  scoreDialogOpen = false;
  selectedConsultant: ConsultantDto | null = null;
  scoreForm: ScoreCommand = this.getEmptyScoreCommand(0);

  columns: TableColumn<ConsultantDto>[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'isPresent', label: 'Is Present' },
    { key: 'isOnline', label: 'Is Online' },
    { key: 'totalScore', label: 'Total Score' }
  ];

  customActions: TableAction<ConsultantDto>[] = [
    { action: 'leads', label: 'View Assigned Leads' },
    { action: 'score', label: 'Give Score' },
    { action: 'attendance', label: 'View Attendance' }
  ];

  constructor(private consultantService: ConsultantService, private router: Router, private toast: ToastService) {
    this.loadConsultants();
  }

  loadConsultants(): void {
    this.consultants = this.consultantService.getConsultants();
  }

  handleAction(event: TableActionClick<ConsultantDto>): void {
    if (event.action === 'leads') this.router.navigate(['/dashboard/consultants', event.row.id, 'leads']);
    if (event.action === 'attendance') this.router.navigate(['/dashboard/consultants', event.row.id, 'attendance']);
    if (event.action === 'score') this.openScoreDialog(event.row);
  }

  openScoreDialog(consultant: ConsultantDto): void {
    this.selectedConsultant = consultant;
    this.scoreForm = this.getEmptyScoreCommand(consultant.id);
    this.scoreDialogOpen = true;
  }

  submitScore(): void {
    this.consultantService.submitScore(this.scoreForm);
    this.scoreDialogOpen = false;
    this.toast.show('Score submitted successfully.');
    this.loadConsultants();
  }

  private getEmptyScoreCommand(consultantId: number): ScoreCommand {
    return { consultantId, reason: 'ManagerReward', scoreValue: 0, description: '' };
  }
}
