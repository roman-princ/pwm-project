import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private usernameRequestId = 0;

  error = '';
  usernameSuggestion = '';
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
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form.controls.email.valueChanges.subscribe((email) => {
      void this.updateGeneratedUsername(email);
    });
  }

  private buildUsernameFromEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      return '';
    }

    const [localPart] = trimmed.split('@');
    const base = localPart
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return base.slice(0, 30);
  }

  private async updateGeneratedUsername(email: string): Promise<void> {
    const requestId = ++this.usernameRequestId;
    const baseUsername = this.buildUsernameFromEmail(email);

    if (!baseUsername) {
      this.form.controls.username.setValue('', { emitEvent: false });
      this.usernameSuggestion = '';
      return;
    }

    const suggestedUsername =
      await this.authService.suggestAvailableUsername(baseUsername);

    if (requestId !== this.usernameRequestId) {
      return;
    }

    this.form.controls.username.setValue(suggestedUsername, {
      emitEvent: false,
    });
    this.usernameSuggestion =
      suggestedUsername !== baseUsername
        ? `Username \"${baseUsername}\" was taken. Using \"${suggestedUsername}\".`
        : '';
  }

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

    const availableUsername = await this.authService.suggestAvailableUsername(
      raw.username,
    );
    if (!availableUsername) {
      this.error = 'Could not generate a valid username from this e-mail.';
      return;
    }

    this.form.controls.username.setValue(availableUsername, {
      emitEvent: false,
    });

    try {
      await this.authService.register({
        firstName: raw.firstName,
        surname: raw.surname,
        email: raw.email,
        organization: raw.organization,
        username: availableUsername,
        password: raw.password,
      });
      this.router.navigate(['/login']);
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : 'Could not register user.';
    }
  }
}
