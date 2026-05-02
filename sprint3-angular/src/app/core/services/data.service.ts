import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import {
  Category,
  DbData,
  EventItem,
  PageContent,
  Site,
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private dbCache: DbData | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly firestore: Firestore,
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

  async fileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Could not read file as data URL.'));
      };
      reader.onerror = () => reject(reader.error ?? new Error('Read failed.'));
      reader.readAsDataURL(file);
    });
  }

  async getEvents(): Promise<EventItem[]> {
    const snapshot = await getDocs(collection(this.firestore, 'events'));
    return snapshot.docs.map((d) => this.enrichEvent(d.data() as EventItem));
  }

  async getUpcomingEvents(): Promise<EventItem[]> {
    const events = await this.getEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((evt) => new Date(`${evt.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEventsNextSevenDays(): Promise<EventItem[]> {
    const events = await this.getEvents();
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
    const eventRef = doc(this.firestore, 'events', String(id));
    const snapshot = await getDoc(eventRef);
    if (!snapshot.exists()) {
      return undefined;
    }

    return this.enrichEvent(snapshot.data() as EventItem);
  }

  async createEvent(eventData: Omit<EventItem, 'id'>): Promise<EventItem> {
    const newId = await this.nextEventId();
    const newEvent: EventItem = { id: newId, ...eventData };

    await setDoc(doc(this.firestore, 'events', String(newId)), newEvent);
    return this.enrichEvent(newEvent);
  }

  async updateEvent(
    id: number,
    updates: Partial<EventItem>,
  ): Promise<EventItem | null> {
    const eventRef = doc(this.firestore, 'events', String(id));
    const existing = await getDoc(eventRef);
    if (!existing.exists()) {
      return null;
    }

    await updateDoc(eventRef, updates as Record<string, unknown>);
    const updated = await getDoc(eventRef);
    return this.enrichEvent(updated.data() as EventItem);
  }

  async deleteEvent(id: number): Promise<boolean> {
    const eventRef = doc(this.firestore, 'events', String(id));
    const existing = await getDoc(eventRef);
    if (!existing.exists()) {
      return false;
    }

    await deleteDoc(eventRef);
    return true;
  }

  private async nextEventId(): Promise<number> {
    return runTransaction(this.firestore, async (transaction) => {
      const counterRef = doc(this.firestore, 'metadata', 'events_counter');
      const counterSnapshot = await transaction.get(counterRef);
      const currentValue = Number(counterSnapshot.data()?.['value'] ?? 200);
      const nextValue = currentValue + 1;

      transaction.set(counterRef, { value: nextValue }, { merge: true });
      return nextValue;
    });
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.loadDb();
    return db.categories;
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
