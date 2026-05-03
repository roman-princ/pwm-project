import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Category, EventItem } from '../../shared/models/models';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';

@Component({
  selector: 'app-all-events',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css',
})
export class AllEventsComponent implements OnInit {
  categories: Category[] = [];
  events: EventItem[] = [];
  activeFilters = new Set<string>();
  visibleCount = 7;

  constructor(private readonly dataService: DataService) {}

  get filteredEvents(): EventItem[] {
    if (this.activeFilters.size === 0) {
      return this.events;
    }
    return this.events.filter((event) =>
      this.activeFilters.has(event.category),
    );
  }

  get visibleEvents(): EventItem[] {
    return this.filteredEvents.slice(0, this.visibleCount);
  }

  get groupedVisibleEvents(): Array<{
    date: string;
    label: string;
    events: EventItem[];
  }> {
    const groups = new Map<
      string,
      { date: string; label: string; events: EventItem[] }
    >();

    for (const event of this.visibleEvents) {
      if (!groups.has(event.date)) {
        groups.set(event.date, {
          date: event.date,
          label: event.dateFormatted ?? event.date,
          events: [],
        });
      }

      groups.get(event.date)?.events.push(event);
    }

    return [...groups.values()].sort((left, right) =>
      left.date.localeCompare(right.date),
    );
  }

  get hasMore(): boolean {
    return this.filteredEvents.length > this.visibleCount;
  }

  async ngOnInit(): Promise<void> {
    this.categories = await this.dataService.getCategories();
    this.events = await this.dataService.getUpcomingEvents();
  }

  toggleFilter(categoryValue: string): void {
    if (this.activeFilters.has(categoryValue)) {
      this.activeFilters.delete(categoryValue);
    } else {
      this.activeFilters.add(categoryValue);
    }
    this.visibleCount = 7;
  }

  resetFilters(): void {
    this.activeFilters.clear();
    this.visibleCount = 7;
  }

  loadMore(): void {
    this.visibleCount += 7;
  }
}
