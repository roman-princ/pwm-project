import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Category,
  DbData,
  EventItem,
  PageContent,
  Site,
  User,
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private dbCache: DbData | null = null;

  constructor(private readonly http: HttpClient) {}

  private async loadDb(): Promise<DbData> {
    if (this.dbCache) {
      return this.dbCache;
    }

    const db = await firstValueFrom(this.http.get<DbData>('data/db.json'));
    const savedEvents = localStorage.getItem('db_events');
    if (savedEvents) {
      try {
        db.events = JSON.parse(savedEvents);
      } catch {
        // Ignore bad local cache.
      }
    }

    this.dbCache = db;
    return db;
  }

  private formatDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private enrichEvent(evt: EventItem): EventItem {
    return {
      ...evt,
      dateFormatted: this.formatDate(evt.date),
    };
  }

  private persistEvents(): void {
    if (!this.dbCache) {
      return;
    }
    localStorage.setItem('db_events', JSON.stringify(this.dbCache.events));
  }

  private getLocalUsers(): User[] {
    try {
      return JSON.parse(localStorage.getItem('db_users') ?? '[]');
    } catch {
      return [];
    }
  }

  async getEvents(): Promise<EventItem[]> {
    const db = await this.loadDb();
    return db.events.map((evt) => this.enrichEvent(evt));
  }

  async getUpcomingEvents(): Promise<EventItem[]> {
    const db = await this.loadDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.events
      .filter((evt) => new Date(`${evt.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((evt) => this.enrichEvent(evt));
  }

  async getEventsNextSevenDays(): Promise<EventItem[]> {
    const db = await this.loadDb();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    return db.events
      .filter((evt) => {
        const eventDate = new Date(`${evt.date}T00:00:00`);
        return eventDate >= now && eventDate <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((evt) => this.enrichEvent(evt));
  }

  async getEventById(id: number): Promise<EventItem | undefined> {
    const db = await this.loadDb();
    const found = db.events.find((evt) => evt.id === id);
    return found ? this.enrichEvent(found) : undefined;
  }

  async createEvent(eventData: Omit<EventItem, 'id'>): Promise<EventItem> {
    const db = await this.loadDb();
    const maxId = db.events.reduce((max, evt) => Math.max(max, evt.id), 0);
    const newEvent: EventItem = {
      id: maxId + 1,
      ...eventData,
    };
    db.events.push(newEvent);
    this.persistEvents();
    return this.enrichEvent(newEvent);
  }

  async updateEvent(
    id: number,
    updates: Partial<EventItem>,
  ): Promise<EventItem | null> {
    const db = await this.loadDb();
    const idx = db.events.findIndex((evt) => evt.id === id);
    if (idx === -1) {
      return null;
    }

    db.events[idx] = { ...db.events[idx], ...updates };
    this.persistEvents();
    return this.enrichEvent(db.events[idx]);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const db = await this.loadDb();
    const idx = db.events.findIndex((evt) => evt.id === id);
    if (idx === -1) {
      return false;
    }

    db.events.splice(idx, 1);
    this.persistEvents();
    return true;
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.loadDb();
    return db.categories;
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const db = await this.loadDb();
    const allUsers = [...db.users, ...this.getLocalUsers()];
    const user = allUsers.find(
      (candidate) =>
        candidate.username === username && candidate.password === password,
    );
    if (!user) {
      return null;
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async registerUser(
    userData: Omit<User, 'id' | 'role'> & { password: string },
  ): Promise<User> {
    const db = await this.loadDb();
    const localUsers = this.getLocalUsers();
    const allUsers = [...db.users, ...localUsers];

    if (allUsers.some((user) => user.username === userData.username)) {
      throw new Error('Username already exists.');
    }
    if (allUsers.some((user) => user.email === userData.email)) {
      throw new Error('E-mail already registered.');
    }

    const maxId = allUsers.reduce((max, user) => Math.max(max, user.id), 0);
    const newUser: User = {
      id: maxId + 1,
      ...userData,
      role: 'user',
    };

    localUsers.push(newUser);
    localStorage.setItem('db_users', JSON.stringify(localUsers));

    const { password: _password, ...safeUser } = newUser;
    return safeUser;
  }

  async getPageContent(pageKey: string): Promise<PageContent> {
    const db = await this.loadDb();
    return db.pages[pageKey] ?? {};
  }

  async getSite(): Promise<Site> {
    const db = await this.loadDb();
    return db.site;
  }
}
