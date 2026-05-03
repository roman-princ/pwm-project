import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { EventItem } from '../../shared/models/models';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
})
export class EventDetailComponent implements OnInit {
  event?: EventItem;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dataService: DataService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      return;
    }
    this.event = await this.dataService.getEventById(id);
  }
}
