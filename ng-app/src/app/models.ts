export interface User {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  organization: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface EventItem {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  registrationUrl: string;
  image: string | null;
  createdBy: number;
}

export interface Category {
  id: number;
  value: string;
  label: string;
}

export interface DbData {
  site: { title: string; language: string };
  categories: Category[];
  users: User[];
  events: EventItem[];
  pages: Record<string, Record<string, string>>;
  partials: Record<string, Record<string, string>>;
}
