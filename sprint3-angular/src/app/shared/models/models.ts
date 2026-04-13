export interface Site {
  title: string;
  language: string;
}

export interface Category {
  id: number;
  value: string;
  label: string;
}

export interface User {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  organization: string;
  username: string;
  password?: string;
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
  dateFormatted?: string;
}

export interface PageContent {
  [key: string]: string;
}

export interface DbData {
  site: Site;
  categories: Category[];
  users: User[];
  events: EventItem[];
  pages: Record<string, PageContent>;
  partials?: Record<string, PageContent>;
}
