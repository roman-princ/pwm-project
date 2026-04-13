import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { User } from './models';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly dataService = inject(DataService);
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      try {
        this.currentUserSubject.next(JSON.parse(raw) as User);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }

  login(username: string, password: string) {
    return this.dataService.getUsers().pipe(
      map((users) => users.find((u) => u.username === username && u.password === password) ?? null),
      tap((user) => {
        this.currentUserSubject.next(user);
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('auth_user');
        }
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('auth_user');
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
}
