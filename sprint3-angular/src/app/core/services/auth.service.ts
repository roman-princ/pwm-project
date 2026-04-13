import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';
import { User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage(),
  );
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly dataService: DataService) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  async login(username: string, password: string): Promise<boolean> {
    const user = await this.dataService.authenticate(username, password);
    if (!user) {
      return false;
    }

    this.persistAuth(user);
    this.currentUserSubject.next(user);
    return true;
  }

  logout(): void {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('auth_user');
    this.currentUserSubject.next(null);
  }

  private persistAuth(user: User): void {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user.username);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      return null;
    }

    try {
      const value = localStorage.getItem('auth_user');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
}
