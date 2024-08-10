import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  mobile: string = '';
  mobileError: string | null = null;

  password: string = '';

  errorMessage: string = '';

  isMobileFocused: boolean = false;
  isPasswordFocused: boolean = false;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {

  }

  login(): void {
    this.authService.login(this.mobile, this.password).subscribe(success => {
      if (success) {
        this.snackBar.open('Login successful', 'Close', {
          duration: 3000, // milliseconds
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      } else {
        this.snackBar.open('Invalid Credentials, Please try again or register!', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onFocus(field: string): void {
    if (field === 'mobile') {
      this.isMobileFocused = true;
      this.mobileError = null;
    } else if (field === 'password') {
      this.isPasswordFocused = true;
    }
  }

  onBlur(field: string): void {
    if (field === 'mobile') {
      this.isMobileFocused = false;
    } else if (field === 'password') {
      this.isPasswordFocused = false;
    }
  }

  // VALIADTE MOBILE
  validateMobile(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // remove any non-digit characters
    value = value.replace(/\D/g, '');

    if (value.length > 10) {
      this.mobileError = 'Mobile number must be exactly 10 digits.';
      this.mobile = value.slice(0, 10); // truncate to 10 digits
    } else if (value.length < 10) {
      this.mobileError = 'Mobile number must be exactly 10 digits.';
      this.mobile = value; // allow shorter input until exactly 10 digits are entered
    } else {
      this.mobileError = null;
      this.mobile = value;
    }

    input.value = this.mobile;
  }
}
