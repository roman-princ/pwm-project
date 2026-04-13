import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly dataService = inject(DataService);
  protected readonly page$ = this.dataService.getPageContent('adminHome');
  protected readonly events$ = this.dataService.getEvents();

  constructor() {
    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/login');
    }
  }
}
