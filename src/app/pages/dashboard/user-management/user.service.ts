import { Injectable } from '@angular/core';
import { UserDto } from '../../../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: UserDto[] = [
    { id: 1, firstName: 'Sara', lastName: 'Ahmadi', phoneNumber: '09120000001', role: 'ADMIN', isActive: true },
    { id: 2, firstName: 'Ali', lastName: 'Karimi', phoneNumber: '09120000002', role: 'CONSULTANT', isActive: true },
    { id: 3, firstName: 'Mina', lastName: 'Moradi', phoneNumber: '09120000003', role: 'PATIENT', isActive: false }
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
