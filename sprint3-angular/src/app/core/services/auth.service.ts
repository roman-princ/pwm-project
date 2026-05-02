import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

type StoredUserProfile = Omit<User, 'password'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly authReady: Promise<void>;
  private resolveAuthReady: (() => void) | null = null;

  constructor(
    private readonly auth: Auth,
    private readonly firestore: Firestore,
  ) {
    this.authReady = new Promise<void>((resolve) => {
      this.resolveAuthReady = resolve;
    });

    authState(this.auth).subscribe(async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUserSubject.next(null);
        this.resolveReadyOnce();
        return;
      }

      const profile = await this.getOrCreateProfile(
        firebaseUser.uid,
        firebaseUser.email ?? '',
      );
      this.currentUserSubject.next(profile);
      this.resolveReadyOnce();
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  async login(identifier: string, password: string): Promise<boolean> {
    try {
      const email = await this.resolveLoginEmail(identifier);
      if (!email) {
        return false;
      }

      await signInWithEmailAndPassword(this.auth, email, password);
      await this.authReady;
      return true;
    } catch {
      return false;
    }
  }

  async register(userData: {
    firstName: string;
    surname: string;
    email: string;
    organization: string;
    username: string;
    password: string;
  }): Promise<void> {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const username = userData.username.trim();
    if (await this.isUsernameTaken(username)) {
      throw new Error('Username already exists.');
    }

    const credential = await createUserWithEmailAndPassword(
      this.auth,
      normalizedEmail,
      userData.password,
    );

    const role: User['role'] = environment.adminEmails
      .map((email) => email.toLowerCase())
      .includes(normalizedEmail)
      ? 'admin'
      : 'user';

    const newProfile: StoredUserProfile = {
      id: await this.nextUserId(),
      firstName: userData.firstName,
      surname: userData.surname,
      email: normalizedEmail,
      organization: userData.organization,
      username,
      role,
    };

    await setDoc(doc(this.firestore, 'users', credential.user.uid), newProfile);
    await setDoc(doc(this.firestore, 'usernames', username), {
      uid: credential.user.uid,
      email: normalizedEmail,
    });
  }

  async suggestAvailableUsername(baseUsername: string): Promise<string> {
    const normalizedBase = baseUsername
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 30);

    if (!normalizedBase) {
      return '';
    }

    if (!(await this.isUsernameTaken(normalizedBase))) {
      return normalizedBase;
    }

    let suffix = 2;
    while (suffix <= 9999) {
      const suffixValue = String(suffix);
      const trimmedBase = normalizedBase.slice(0, 30 - suffixValue.length);
      const candidate = `${trimmedBase}${suffixValue}`;
      if (!(await this.isUsernameTaken(candidate))) {
        return candidate;
      }
      suffix += 1;
    }

    return `${Date.now()}`.slice(-10);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  async isCurrentUserAdmin(): Promise<boolean> {
    await this.authReady;
    return this.currentUser?.role === 'admin';
  }

  private resolveReadyOnce(): void {
    if (!this.resolveAuthReady) {
      return;
    }
    this.resolveAuthReady();
    this.resolveAuthReady = null;
  }

  private async resolveLoginEmail(identifier: string): Promise<string | null> {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }

    const snapshot = await getDoc(doc(this.firestore, 'usernames', trimmed));
    if (!snapshot.exists()) {
      return null;
    }
    return (snapshot.data() as { email: string }).email;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const snapshot = await getDoc(doc(this.firestore, 'usernames', username));
    return snapshot.exists();
  }

  private async nextUserId(): Promise<number> {
    return runTransaction(this.firestore, async (transaction) => {
      const counterRef = doc(this.firestore, 'metadata', 'users_counter');
      const counterSnapshot = await transaction.get(counterRef);
      const currentValue = Number(counterSnapshot.data()?.['value'] ?? 1000);
      const nextValue = currentValue + 1;

      transaction.set(counterRef, { value: nextValue }, { merge: true });
      return nextValue;
    });
  }

  private async getOrCreateProfile(uid: string, email: string): Promise<User> {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }

    const normalizedEmail = email.toLowerCase();
    const baseUsername =
      normalizedEmail.split('@')[0] || `user-${Date.now()}`;
    const fallbackProfile: StoredUserProfile = {
      id: await this.nextUserId(),
      firstName: '',
      surname: '',
      email: normalizedEmail,
      organization: '',
      username: baseUsername,
      role: 'user',
    };

    await setDoc(userRef, fallbackProfile);
    return fallbackProfile;
  }
}
