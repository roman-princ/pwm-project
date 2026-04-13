import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Category } from '../../shared/models/models';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  categories: Category[] = [];
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
    private readonly dataService: DataService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.categories = await this.dataService.getCategories();
  }

  private isFutureDateTime(dateValue: string, timeValue: string): boolean {
    const now = new Date();
    const selected = new Date(`${dateValue}T${timeValue}:00`);
    return selected.getTime() >= now.getTime();
  }

  async submit(): Promise<void> {
    this.error = '';
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (!this.isFutureDateTime(raw.date, raw.time)) {
      this.error = 'Date and time must be in the future.';
      return;
    }

    await this.dataService.createEvent({
      title: raw.title,
      category: raw.category,
      organizer: raw.organizer,
      description: raw.description,
      date: raw.date,
      time: raw.time,
      location: raw.location,
      registrationUrl: raw.registrationUrl,
      image: raw.image || null,
      createdBy: this.authService.currentUser?.id ?? 1,
    });

    this.router.navigate(['/admin-home']);
  }
}
