import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { AboutComponent } from './features/about/about.component';
import { AdminHomeComponent } from './features/admin-home/admin-home.component';
import { AllEventsComponent } from './features/all-events/all-events.component';
import { CreateEventComponent } from './features/create-event/create-event.component';
import { EditEventComponent } from './features/edit-event/edit-event.component';
import { EventDetailComponent } from './features/event-detail/event-detail.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { RegistrationComponent } from './features/registration/registration.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'all-events', component: AllEventsComponent },
  { path: 'event-detail/:id', component: EventDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'create-event',
    component: CreateEventComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'edit-event/:id',
    component: EditEventComponent,
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '' },
];
