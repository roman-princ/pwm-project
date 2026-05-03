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
  imageUploading = false;
  selectedImageFile: File | null = null;
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files?.[0] ?? null;
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

    const currentUserId = this.authService.currentUser?.id;
    if (!currentUserId) {
      this.error = 'You must be logged in to create events.';
      return;
    }

    let imageUrl: string | null = raw.image.trim() || null;
    if (this.selectedImageFile) {
      try {
        this.imageUploading = true;
        imageUrl = await this.dataService.fileToBase64(this.selectedImageFile);
      } catch {
        this.error = 'Could not read the selected image.';
        this.imageUploading = false;
        return;
      }
      this.imageUploading = false;
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
      image: imageUrl,
      createdBy: currentUserId,
    });

    this.router.navigate(['/admin-home']);
  }
}
