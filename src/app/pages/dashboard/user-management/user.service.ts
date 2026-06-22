import { Injectable } from '@angular/core';
import { UserDto } from '../../../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: UserDto[] = [
    { id: 1, firstName: 'سارا', lastName: 'احمدی', phoneNumber: '09120000001', role: 'مدیر', isActive: true },
    { id: 2, firstName: 'علی', lastName: 'کریمی', phoneNumber: '09120000002', role: 'مشاور', isActive: true },
    { id: 3, firstName: 'مینا', lastName: 'مرادی', phoneNumber: '09120000003', role: 'بیمار', isActive: false }
  ];

  getUsers(): UserDto[] {
    return [...this.users];
  }

  addUser(user: Omit<UserDto, 'id'>): UserDto {
    const newUser = { ...user, id: Date.now() };
    this.users = [...this.users, newUser];
    return newUser;
  }

  updateUser(user: UserDto): UserDto {
    this.users = this.users.map(item => item.id === user.id ? { ...user } : item);
    return user;
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
  }
}
