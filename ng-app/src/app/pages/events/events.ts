import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-events',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
  private readonly dataService = inject(DataService);
  protected readonly categoryControl = new FormControl('all', { nonNullable: true });
  protected readonly page$ = this.dataService.getPageContent('allEvents');
  protected readonly categories$ = this.dataService.getCategories();
  protected readonly events$ = combineLatest([
    this.dataService.getUpcomingEvents(),
    this.categoryControl.valueChanges.pipe(startWith('all'))
  ]).pipe(
    map(([events, category]) => (category === 'all' ? events : events.filter((e) => e.category === category)))
  );
}
