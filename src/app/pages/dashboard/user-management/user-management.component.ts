import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseDialogComponent, EmptyStateComponent, TableAction, TableActionClick, TableColumn, TableComponent } from '../../../shared/base';
import { ToastService } from '../../../services/toast.service';
import { UserDto } from '../../../models/admin-dashboard.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, BaseDialogComponent, EmptyStateComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  users: UserDto[] = [];
  dialogOpen = false;
  dialogMode: 'create' | 'edit' | 'delete' = 'create';
  selectedUser: UserDto | null = null;

  formUser: UserDto = this.getEmptyUser();

  columns: TableColumn<UserDto>[] = [
    { key: 'firstName', label: 'نام' },
    { key: 'lastName', label: 'نام خانوادگی' },
    { key: 'phoneNumber', label: 'شماره تلفن' },
    { key: 'role', label: 'نقش' },
    { key: 'isActive', label: 'فعال است' }
  ];

  actions: TableAction<UserDto>[] = [
    { action: 'edit', label: 'ویرایش' },
    { action: 'delete', label: 'حذف' }
  ];

  constructor(private userService: UserService, private toast: ToastService) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.userService.getUsers();
  }

  openAddDialog(): void {
    this.dialogMode = 'create';
    this.selectedUser = null;
    this.formUser = this.getEmptyUser();
    this.dialogOpen = true;
  }

  handleAction(event: TableActionClick<UserDto>): void {
    if (event.action === 'edit') this.openEditDialog(event.row);
    if (event.action === 'delete') this.openDeleteDialog(event.row);
  }

  openEditDialog(user: UserDto): void {
    this.dialogMode = 'edit';
    this.selectedUser = user;
    this.formUser = { ...user };
    this.dialogOpen = true;
  }

  openDeleteDialog(user: UserDto): void {
    this.dialogMode = 'delete';
    this.selectedUser = user;
    this.dialogOpen = true;
  }

  confirmDialog(): void {
    if (this.dialogMode === 'delete' && this.selectedUser) {
      this.userService.deleteUser(this.selectedUser.id);
      this.toast.show('کاربر با موفقیت حذف شد');
    }

    if (this.dialogMode === 'create') {
      this.userService.addUser({
        firstName: this.formUser.firstName,
        lastName: this.formUser.lastName,
        phoneNumber: this.formUser.phoneNumber,
        role: this.formUser.role,
        isActive: this.formUser.isActive
      });
      this.toast.show('کاربر با موفقیت اضافه شد');
    }

    if (this.dialogMode === 'edit') {
      this.userService.updateUser(this.formUser);
      this.toast.show('کاربر با موفقیت ویرایش شد');
    }

    this.dialogOpen = false;
    this.loadUsers();
  }

  get dialogTitle(): string {
    if (this.dialogMode === 'create') return 'افزودن کاربر';
    if (this.dialogMode === 'edit') return 'ویرایش کاربر';
    return 'حذف کاربر';
  }

  private getEmptyUser(): UserDto {
    return { id: 0, firstName: '', lastName: '', phoneNumber: '', role: 'بیمار', isActive: true };
  }
}
