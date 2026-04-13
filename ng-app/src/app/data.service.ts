import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Category, DbData, EventItem, User } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);
  private static readonly EVENTS_KEY = 'db_events';
  private static readonly USERS_KEY = 'db_users';

  private readonly db$ = this.http.get<DbData>('/db.json').pipe(shareReplay(1));

  getSiteTitle(): Observable<string> {
    return this.db$.pipe(map((db) => db.site.title));
  }

  getPageContent(key: string): Observable<Record<string, string>> {
    return this.db$.pipe(map((db) => db.pages[key] ?? {}));
  }

  getPartialContent(key: string): Observable<Record<string, string>> {
    return this.db$.pipe(map((db) => db.partials[key] ?? {}));
  }

  getCategories(): Observable<Category[]> {
    return this.db$.pipe(map((db) => db.categories));
  }

  getEvents(): Observable<EventItem[]> {
    return this.db$.pipe(map((db) => this.getStoredEvents(db)));
  }

  getUpcomingEvents(): Observable<EventItem[]> {
    return this.getEvents().pipe(
      map((events) =>
        [...events]
          .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
          .filter((event) => new Date(`${event.date}T${event.time}`).getTime() >= Date.now())
      )
    );
  }

  getEventById(id: number): Observable<EventItem | null> {
    return this.getEvents().pipe(map((events) => events.find((event) => event.id === id) ?? null));
  }

  createEvent(payload: Omit<EventItem, 'id'>): Observable<EventItem> {
    return this.db$.pipe(
      map((db) => {
        const events = this.getStoredEvents(db);
        const nextId = events.length ? Math.max(...events.map((e) => e.id)) + 1 : 1;
        const created = { ...payload, id: nextId };
        this.writeEvents([...events, created]);
        return created;
      })
    );
  }

  updateEvent(id: number, payload: Partial<EventItem>): Observable<EventItem | null> {
    return this.db$.pipe(
      map((db) => {
        const events = this.getStoredEvents(db);
        const index = events.findIndex((event) => event.id === id);
        if (index < 0) return null;
        const updated = { ...events[index], ...payload, id };
        const next = [...events];
        next[index] = updated;
        this.writeEvents(next);
        return updated;
      })
    );
  }

  deleteEvent(id: number): Observable<boolean> {
    return this.db$.pipe(
      map((db) => {
        const events = this.getStoredEvents(db);
        const filtered = events.filter((event) => event.id !== id);
        if (filtered.length === events.length) return false;
        this.writeEvents(filtered);
        return true;
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.db$.pipe(map((db) => this.getStoredUsers(db)));
  }

  registerUser(payload: Omit<User, 'id' | 'role'>): Observable<User> {
    return this.db$.pipe(
      map((db) => {
        const users = this.getStoredUsers(db);
        if (users.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
          throw new Error('USERNAME_TAKEN');
        }
        if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new Error('EMAIL_TAKEN');
        }
        const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
        const created: User = { ...payload, id: nextId, role: 'user' };
        this.writeUsers([...users, created]);
        return created;
      })
    );
  }

  private getStoredEvents(db: DbData): EventItem[] {
    const raw = localStorage.getItem(DataService.EVENTS_KEY);
    if (!raw) return db.events;
    try {
      return JSON.parse(raw) as EventItem[];
    } catch {
      return db.events;
    }
  }

  private getStoredUsers(db: DbData): User[] {
    const raw = localStorage.getItem(DataService.USERS_KEY);
    if (!raw) return db.users;
    try {
      return JSON.parse(raw) as User[];
    } catch {
      return db.users;
    }
  }

  private writeEvents(events: EventItem[]): void {
    localStorage.setItem(DataService.EVENTS_KEY, JSON.stringify(events));
  }

  private writeUsers(users: User[]): void {
    localStorage.setItem(DataService.USERS_KEY, JSON.stringify(users));
  }
}
