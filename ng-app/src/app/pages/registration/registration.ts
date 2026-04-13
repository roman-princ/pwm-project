import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  protected submitted = false;
  protected errorMessage = '';
  protected readonly page$ = this.dataService.getPageContent('registration');

  protected readonly form = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/)]
      ],
      passwordConfirm: ['', [Validators.required, Validators.minLength(8)]]
    },
    { validators: this.passwordsMatchValidator }
  );

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('passwordConfirm')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  submit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, surname, email, username, password } = this.form.getRawValue();
    this.dataService
      .registerUser({
        firstName: firstName ?? '',
        surname: surname ?? '',
        email: email ?? '',
        organization: '',
        username: username ?? '',
        password: password ?? ''
      })
      .subscribe({
        next: () => {
          this.submitted = true;
          setTimeout(() => this.router.navigateByUrl('/login'), 900);
        },
        error: (err: Error) => {
          if (err.message === 'USERNAME_TAKEN') this.errorMessage = 'Username already exists.';
          else if (err.message === 'EMAIL_TAKEN') this.errorMessage = 'Email already exists.';
          else this.errorMessage = 'Registration failed.';
        }
      });
  }
}
