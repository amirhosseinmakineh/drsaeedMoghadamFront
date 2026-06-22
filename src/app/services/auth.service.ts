import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'PATIENT';

export interface AuthUser {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

interface StoredUser extends AuthUser {
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly usersKey = 'auth_users';
  readonly currentUser = signal<AuthUser | null>(this.getUser());

  constructor(private router: Router, private toast: ToastService) {}

  login(phoneNumber: string, password: string): boolean {
    const user = this.getStoredUsers().find(item => item.phoneNumber === phoneNumber && item.password === password);

    if (!user) {
      this.toast.show('شماره تلفن یا رمز عبور اشتباه است');
      return false;
    }

    this.saveTokenForUser(user);
    this.toast.show('ورود موفق');
    this.redirectByRole();
    return true;
  }

  register(user: StoredUser): boolean {
    const users = this.getStoredUsers();
    const existingIndex = users.findIndex(item => item.phoneNumber === user.phoneNumber);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.saveTokenForUser(user);
    this.toast.show('ثبت‌نام موفق');
    this.redirectByRole();
    return true;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.toast.show('خروج موفق');
    this.router.navigateByUrl('/');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    const decodedToken = this.decodeToken();

    if (!decodedToken) {
      return null;
    }

    return {
      firstName: decodedToken.firstName ?? '',
      lastName: decodedToken.lastName ?? '',
      phoneNumber: decodedToken.phoneNumber ?? '',
      role: decodedToken.role
    };
  }

  getRole(): UserRole | null {
    const decodedToken = this.decodeToken();
    const role = decodedToken?.role;
    return role ?? null;
  }

  getDashboardUrl(role: UserRole | null = this.getRole()): string {
    if (role === 'ADMIN') return '/dashboard/admin';
    if (role === 'CONSULTANT') return '/dashboard/consultant';
    return '/dashboard/patient';
  }

  redirectByRole() {
    this.router.navigateByUrl(this.getDashboardUrl());
  }

  private saveTokenForUser(user: AuthUser) {
    const token = this.createToken(user);
    localStorage.setItem(this.tokenKey, token);
    this.currentUser.set(this.getUser());
  }

  private createToken(user: AuthUser): string {
    const header = this.encode({ alg: 'none', typ: 'JWT' });
    const payload = this.encode({ ...user, role: user.role });
    return `${header}.${payload}.demo-signature`;
  }

  private decodeToken(): (AuthUser & { role: UserRole }) | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(this.fromBase64Url(payload)));
    } catch {
      localStorage.removeItem(this.tokenKey);
      return null;
    }
  }

  private encode(value: unknown): string {
    return btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private fromBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  }

  private getStoredUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(this.usersKey) ?? '[]');
    } catch {
      return [];
    }
  }
}
