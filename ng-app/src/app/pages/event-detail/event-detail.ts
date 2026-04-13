import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly dataService = inject(DataService);
  protected readonly page$ = this.dataService.getPageContent('eventDetail');
  protected readonly event$ = this.route.paramMap.pipe(
    switchMap((params) => this.dataService.getEventById(Number(params.get('id'))))
  );
}
