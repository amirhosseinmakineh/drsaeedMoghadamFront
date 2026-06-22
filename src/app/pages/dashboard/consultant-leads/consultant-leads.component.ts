import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmptyStateComponent, TableColumn, TableComponent } from '../../../shared/base';
import { LeadDto } from '../../../models/admin-dashboard.model';
import { ConsultantService } from '../consultant-management/consultant.service';

@Component({
  selector: 'app-consultant-leads',
  standalone: true,
  imports: [CommonModule, RouterLink, TableComponent, EmptyStateComponent],
  templateUrl: './consultant-leads.component.html',
  styleUrl: './consultant-leads.component.scss'
})
export class ConsultantLeadsComponent {
  consultantId = Number(this.route.snapshot.paramMap.get('consultantId'));
  leads: LeadDto[] = this.consultantService.getConsultantLeads(this.consultantId);

  columns: TableColumn<LeadDto>[] = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'leadStatus', label: 'Lead Status' },
    { key: 'assignmentDate', label: 'Assignment Date' },
    { key: 'isConsultantOnline', label: 'Is Consultant Online' },
    { key: 'hasCalled', label: 'Has Called' }
  ];

  constructor(private route: ActivatedRoute, private consultantService: ConsultantService) {}
}
