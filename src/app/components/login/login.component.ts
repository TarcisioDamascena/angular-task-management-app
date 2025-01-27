import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-login',
  standalone: true,
  host: { 'id': 'login-component' },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if(control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if(control?.hasError('minlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${field === 'username' ? '3' : '6'} characters long`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loginError = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => {
          this.loginError = 'Invalid username or password';
          console.error('Login failed:', err);
        }
      })
    }
  }
}
