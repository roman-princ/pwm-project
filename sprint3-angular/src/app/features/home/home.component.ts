import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { EventItem } from '../../shared/models/models';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  heroTitle = 'Welcome to Las Palmas';
  heroDescription = '';
  eventsHeading = 'Coming soon';
  events: EventItem[] = [];

  constructor(private readonly dataService: DataService) {}

  async ngOnInit(): Promise<void> {
    const content = await this.dataService.getPageContent('home');
    this.heroTitle = content['heroTitle'] ?? this.heroTitle;
    this.heroDescription = content['heroDescription'] ?? this.heroDescription;
    this.eventsHeading = content['eventsHeading'] ?? this.eventsHeading;
    this.events = await this.dataService.getEventsNextSevenDays();
  }
}
