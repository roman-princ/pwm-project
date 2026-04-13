import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Category, EventItem } from '../../shared/models/models';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css',
})
export class EditEventComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  categories: Category[] = [];
  event?: EventItem;
  error = '';
  submitted = false;

  readonly form = this.fb.nonNullable.group({
    title: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    category: ['', [Validators.required]],
    organizer: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    location: ['', [Validators.required]],
    registrationUrl: [
      '',
      [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
    ],
    image: [''],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dataService: DataService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.categories = await this.dataService.getCategories();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event = await this.dataService.getEventById(id);

    if (!this.event) {
      this.error = 'Event not found.';
      return;
    }

    this.form.patchValue({
      title: this.event.title,
      category: this.event.category,
      organizer: this.event.organizer,
      description: this.event.description,
      date: this.event.date,
      time: this.event.time,
      location: this.event.location,
      registrationUrl: this.event.registrationUrl,
      image: this.event.image ?? '',
    });
  }

  async submit(): Promise<void> {
    this.error = '';
    this.submitted = true;
    if (!this.event) {
      this.error = 'Event not found.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const selected = new Date(`${raw.date}T${raw.time}:00`);
    if (selected.getTime() < Date.now()) {
      this.error = 'Date and time must be in the future.';
      return;
    }

    const updated = await this.dataService.updateEvent(this.event.id, {
      title: raw.title,
      category: raw.category,
      organizer: raw.organizer,
      description: raw.description,
      date: raw.date,
      time: raw.time,
      location: raw.location,
      registrationUrl: raw.registrationUrl,
      image: raw.image || null,
    });

    if (!updated) {
      this.error = 'Could not update event.';
      return;
    }

    this.router.navigate(['/admin-home']);
  }

  async deleteEvent(): Promise<void> {
    if (!this.event) {
      return;
    }

    await this.dataService.deleteEvent(this.event.id);
    this.router.navigate(['/admin-home']);
  }
}
