import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Database,
  get,
  ref as dbRef,
  remove,
  set,
  update,
} from '@angular/fire/database';
import {
  Storage,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from '@angular/fire/storage';
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

  constructor(
    private readonly http: HttpClient,
    private readonly database: Database,
    private readonly storage: Storage,
  ) {}

  private async loadDb(): Promise<DbData> {
    if (this.dbCache) {
      return this.dbCache;
    }

    const db = await firstValueFrom(this.http.get<DbData>('data/db.json'));
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

  private async ensureEventsInitialized(): Promise<void> {
    const eventsRef = dbRef(this.database, 'events');
    const existingEvents = await get(eventsRef);
    if (existingEvents.exists()) {
      return;
    }

    const db = await this.loadDb();
    const seedPayload: Record<string, EventItem> = {};
    for (const event of db.events) {
      seedPayload[String(event.id)] = event;
    }

    await set(eventsRef, seedPayload);
  }

  private async getEventsFromRealtimeDb(): Promise<EventItem[]> {
    await this.ensureEventsInitialized();
    const eventsRef = dbRef(this.database, 'events');
    const snapshot = await get(eventsRef);
    if (!snapshot.exists()) {
      return [];
    }

    const raw = snapshot.val() as Record<string, EventItem>;
    return Object.values(raw).map((evt) => this.enrichEvent(evt));
  }

  async uploadEventImage(file: File, createdBy: number): Promise<string> {
    const safeFileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const imagePath = `events/${createdBy}/${Date.now()}-${safeFileName}`;
    const imageRef = storageRef(this.storage, imagePath);

    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  }

  private getLocalUsers(): User[] {
    try {
      return JSON.parse(localStorage.getItem('db_users') ?? '[]');
    } catch {
      return [];
    }
  }

  async getEvents(): Promise<EventItem[]> {
    return this.getEventsFromRealtimeDb();
  }

  async getUpcomingEvents(): Promise<EventItem[]> {
    const events = await this.getEventsFromRealtimeDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((evt) => new Date(`${evt.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEventsNextSevenDays(): Promise<EventItem[]> {
    const events = await this.getEventsFromRealtimeDb();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    return events
      .filter((evt) => {
        const eventDate = new Date(`${evt.date}T00:00:00`);
        return eventDate >= now && eventDate <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEventById(id: number): Promise<EventItem | undefined> {
    await this.ensureEventsInitialized();
    const eventRef = dbRef(this.database, `events/${id}`);
    const snapshot = await get(eventRef);
    if (!snapshot.exists()) {
      return undefined;
    }

    return this.enrichEvent(snapshot.val() as EventItem);
  }

  async createEvent(eventData: Omit<EventItem, 'id'>): Promise<EventItem> {
    const events = await this.getEventsFromRealtimeDb();
    const maxId = events.reduce((max, evt) => Math.max(max, evt.id), 0);
    const newEvent: EventItem = {
      id: maxId + 1,
      ...eventData,
    };

    await set(dbRef(this.database, `events/${newEvent.id}`), newEvent);
    return this.enrichEvent(newEvent);
  }

  async updateEvent(
    id: number,
    updates: Partial<EventItem>,
  ): Promise<EventItem | null> {
    const eventRef = dbRef(this.database, `events/${id}`);
    const existingEventSnapshot = await get(eventRef);
    if (!existingEventSnapshot.exists()) {
      return null;
    }

    await update(eventRef, updates);
    const updatedSnapshot = await get(eventRef);
    return this.enrichEvent(updatedSnapshot.val() as EventItem);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const eventRef = dbRef(this.database, `events/${id}`);
    const existingEventSnapshot = await get(eventRef);
    if (!existingEventSnapshot.exists()) {
      return false;
    }

    await remove(eventRef);
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

    const safeUser = { ...user };
    delete safeUser.password;
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

    const safeUser = { ...newUser };
    delete safeUser.password;
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
