import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { EventItem } from '../../shared/models/models';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
})
export class AdminHomeComponent implements OnInit {
  myEvents: EventItem[] = [];

  constructor(
    public authService: AuthService,
    private readonly dataService: DataService,
  ) {}

  async ngOnInit(): Promise<void> {
    const events = await this.dataService.getEvents();
    const currentUserId = this.authService.currentUser?.id;
    this.myEvents = events
      .filter((event) => event.createdBy === currentUserId)
      .slice(0, 4);
  }
}
