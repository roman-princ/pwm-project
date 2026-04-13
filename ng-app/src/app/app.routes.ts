import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { AdminHome } from './pages/admin-home/admin-home';
import { CreateEvent } from './pages/create-event/create-event';
import { EditEvent } from './pages/edit-event/edit-event';
import { EventDetail } from './pages/event-detail/event-detail';
import { Events } from './pages/events/events';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registration } from './pages/registration/registration';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'main', component: Home },
  { path: 'events', component: Events },
  { path: 'events/create', component: CreateEvent },
  { path: 'events/:id', component: EventDetail },
  { path: 'events/:id/edit', component: EditEvent },
  { path: 'admin', component: AdminHome },
  { path: 'about', component: About },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: '**', redirectTo: '' }
];
