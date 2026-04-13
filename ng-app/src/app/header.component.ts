import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header" *ngIf="partial$ | async as partial">
      <div class="header__container">
        <div class="header__brand">
          <a routerLink="/" class="header__brand-link">
            <img class="header__logo" src="/assets/logo.png" alt="Erasmus Events logo" />
          </a>
        </div>

        <button class="header__hamburger" [class.is-open]="menuOpen" (click)="toggleMenu()" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="header__actions" [class.is-open]="menuOpen">
          <div class="header_search-container">
            <form class="header__search" role="search">
              <span class="header__icon">
                <img src="/assets/search.png" alt="Search" />
              </span>
              <input class="header__search-input" type="search" [placeholder]="partial['searchPlaceholder']" />
            </form>
          </div>

          <nav class="header__nav">
            <a routerLink="/events" class="header__link" (click)="menuOpen = false">{{ partial['navAllEvents'] }}</a>
            <a routerLink="/about" class="header__link" (click)="menuOpen = false">{{ partial['navAbout'] }}</a>
            <a *ngIf="auth.isAdmin()" routerLink="/events/create" class="header__link header__link--admin" (click)="menuOpen = false">
              {{ partial['createEventLink'] }}
            </a>
          </nav>

          <a *ngIf="!(auth.currentUser$ | async)" routerLink="/login" class="header__login" (click)="menuOpen = false">
            <span class="header__login-icon">👤</span>
            <span class="header__login-text">{{ partial['loginText'] }}</span>
          </a>

          <button *ngIf="auth.currentUser$ | async" class="header__logout" (click)="logout()">
            {{ partial['logoutBtn'] }}
          </button>
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly partial$ = inject(DataService).getPartialContent('header');
  private readonly router = inject(Router);
  protected menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
