import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-create-event',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly auth = inject(AuthService);
  protected readonly page$ = this.dataService.getPageContent('createEvent');
  protected readonly categories$ = this.dataService.getCategories();
  protected errorMessage = '';
  protected readonly today = new Date().toISOString().split('T')[0];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    category: ['', [Validators.required]],
    organizer: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    location: ['', [Validators.required]],
    registrationUrl: ['', [Validators.required]],
    image: ['']
  });

  constructor() {
    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/login');
    }
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

    this.dataService
      .createEvent({
        ...values,
        registrationUrl: values.registrationUrl,
        image: null,
        createdBy: 1
      })
      .subscribe(() => this.router.navigateByUrl('/events'));
  }
}
