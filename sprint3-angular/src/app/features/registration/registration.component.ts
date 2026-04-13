import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BackButtonComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);

  error = '';
  submitted = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    organization: [''],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordAgain: ['', [Validators.required]],
  });

  constructor(
    private readonly dataService: DataService,
    private readonly router: Router,
  ) {}

  async submit(): Promise<void> {
    this.error = '';
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.password !== raw.passwordAgain) {
      this.error = 'Passwords do not match.';
      return;
    }

    try {
      await this.dataService.registerUser({
        firstName: raw.firstName,
        surname: raw.surname,
        email: raw.email,
        organization: raw.organization,
        username: raw.username,
        password: raw.password,
      });
      this.router.navigate(['/login']);
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : 'Could not register user.';
    }
  }
}
