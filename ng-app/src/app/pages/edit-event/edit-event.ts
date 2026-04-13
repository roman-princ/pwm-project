import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-edit-event',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})
export class EditEvent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly auth = inject(AuthService);
  protected readonly page$ = this.dataService.getPageContent('editEvent');
  protected readonly categories$ = this.dataService.getCategories();
  protected errorMessage = '';
  protected eventId = 0;
  protected readonly today = new Date().toISOString().split('T')[0];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    category: ['', [Validators.required]],
    organizer: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    location: ['', [Validators.required]],
    registrationUrl: ['', [Validators.required]]
  });

  constructor() {
    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.route.paramMap
      .pipe(switchMap((params) => this.dataService.getEventById(Number(params.get('id')))))
      .subscribe((event) => {
        if (!event) {
          this.router.navigateByUrl('/events');
          return;
        }
        this.eventId = event.id;
        this.form.patchValue(event);
      });
  }

  submit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    const now = new Date();
    if (values.date === this.today && `${values.date}T${values.time}` < now.toISOString().slice(0, 16)) {
      this.errorMessage = 'Time cannot be in the past for today.';
      return;
    }

    this.dataService.updateEvent(this.eventId, values).subscribe(() => {
      this.router.navigateByUrl(`/events/${this.eventId}`);
    });
  }

  deleteEvent() {
    if (!confirm('Delete this event?')) return;
    this.dataService.deleteEvent(this.eventId).subscribe(() => this.router.navigateByUrl('/events'));
  }
}
