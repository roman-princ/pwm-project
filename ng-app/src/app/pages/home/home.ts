import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly dataService = inject(DataService);
  protected readonly page$ = this.dataService.getPageContent('home');
  protected readonly events$ = this.dataService.getUpcomingEvents();
}
