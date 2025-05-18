import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../models/user.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatCardModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  registrationFailed = false;
  registrationError = "";
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]]
    }),
    password: ['', [Validators.required, Validators.minLength(6)]],
    repassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  register(): void {
    if (this.registerForm.invalid) {
      this.registrationError = 'Regisztráció előtt javítson ki minden tartalmi hibát!';
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const rePassword = this.registerForm.get('repassword')?.value;

    
    if (password !== rePassword) {
      this.registrationError = 'A két jelszó nem egyezik!';
      return;
    }

    this.loading = true;

    const userData: Partial<User> = {
      name: {
        firstname: this.registerForm.value.name?.firstname || '',
        lastname: this.registerForm.value.name?.lastname || ''
      },
      email: this.registerForm.value.email || '',
    };

    const email = this.registerForm.value.email || '';
    const pw = this.registerForm.value.password || '';

    this.authService.signUp(email, pw, userData)
      .then(() => {
        this.registrationError = '';
        this.loading = false;
        this.snackBar.open('Sikeres regisztráció!', 'OK', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.router.navigateByUrl('/home');
      })
      .catch(error => {
        this.registrationFailed = true;
        console.error('Regisztrációs hiba:', error);
        this.loading = false;
        
        switch(error.code) {
          case 'auth/email-already-in-use':
            this.registrationError = 'Az email cím már használatban van!';
            break;
          case 'auth/invalid-email':
            this.registrationError = 'Érvénytelen email cím!';
            break;
          case 'auth/weak-password':
            this.registrationError = 'A jelszónak legalább 6 karakter hosszúnak kell lennie!';
            break;
          default:
            this.registrationError = 'A regisztráció során hiba merült fel. Kérjük próbálkozzon később.';
        }
        this.snackBar.open(this.registrationError, 'Bezár', {
        duration: 6000,
        panelClass: ['error-snackbar']
      });
      });
  }

}
