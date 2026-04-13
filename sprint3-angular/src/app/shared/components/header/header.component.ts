import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menuOpen = false;

  constructor(
    public authService: AuthService,
    private readonly router: Router,
  ) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/']);
  }
}
