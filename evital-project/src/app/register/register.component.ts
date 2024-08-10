import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{

  registerForm: FormGroup;

  name: string = '';
  mobile: string = '';
  password: string = '';
  email: string = '';
  address: string = '';
  city: string = '';
  state: string = '';
  zip: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  nameError: string | null = null;
  mobileError: string | null = null;
  emailError: string | null = null;
  cityError: string | null = null;
  stateError: string | null = null;
  zipError: string | null = null;

  isNameFocused: boolean = false;
  isMobileFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isEmailFocused: boolean = false;
  isAddressFocused: boolean = false;
  isCityFocused: boolean = false;
  isStateFocused: boolean = false;
  isZipFocused: boolean = false;

  private images: string[] = [
    'https://images.unsplash.com/photo-1523243319451-54b60322f948?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1668487826871-2f2cac23ad56?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1668487826666-baa00865bc13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fG1lZGljaW5lfGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1562243061-204550d8a2c9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fG1lZGljaW5lfGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1573883429746-084be9b5cfca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fG1lZGljaW5lfGVufDB8fDB8fHww',
  ];

  private currentIndex: number = 0;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z]+$/)]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30), Validators.pattern(/^[^\d]+@[^\s]+\.[^\s]+$/)]],
      address: ['', Validators.required],
      city: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z]+$/)]],
      state: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z]+$/)]],
      zip: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnInit() {
    this.changeBackgroundImage();
  }

  private changeBackgroundImage(): void {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      const backgroundImage = this.images[this.currentIndex];
      document.querySelector('.background-container')?.setAttribute('style', `background-image: url(${backgroundImage});`);
    }, 5000); // Change image every 5 seconds
  }

  register(): void {
    this.authService.register(this.name, this.mobile, this.password, this.email, this.address, this.city, this.state, this.zip).subscribe(success => {
      if (success) {
        this.snackBar.open('Registration successful', 'Close', {
          duration: 3000, // milliseconds
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      } else {
        this.snackBar.open('Registration failed', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onFocus(field: string): void {
    switch (field) {
      case 'name':
        this.isNameFocused = true;
        this.nameError = null;
        break;
      case 'mobile':
        this.isMobileFocused = true;
        this.mobileError = null;
        break;
      case 'password':
        this.isPasswordFocused = true;
        break;
      case 'email':
        this.isEmailFocused = true;
        this.emailError = null;
        break;
      case 'address':
        this.isAddressFocused = true;
        break;
      case 'city':
        this.isCityFocused = true;
        this.cityError = null;
        break;
      case 'state':
        this.isStateFocused = true;
        this.isStateFocused = false;
        break;
      case 'zip':
        this.isZipFocused = true;
        this.zipError = null;
        break;
    }
  }

  onBlur(field: string): void {
    switch (field) {
      case 'name':
        this.isNameFocused = false;
        break;
      case 'mobile':
        this.isMobileFocused = false;
        break;
      case 'password':
        this.isPasswordFocused = false;
        break;
      case 'email':
        this.isEmailFocused = false;
        break;
      case 'address':
        this.isAddressFocused = false;
        break;
      case 'city':
        this.isCityFocused = false;
        break;
      case 'state':
        this.isStateFocused = false;
        break;
      case 'zip':
        this.isZipFocused = false;
        break;
    }
  }

  // VALIADTE NAME
  validateName(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // remove any non-alphabetic characters
    value = value.replace(/[^a-zA-Z]/g, '');

    if (value.length > 30) {
      this.nameError = 'Name must be 30 characters or less.';
      this.name = value.slice(0, 30); // truncate to 30 characters
    } else {
      this.nameError = null;
      this.name = value;
    }

    input.value = this.name;
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

  // VALIADTE EMAIL
  validateEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // trim the input to remove leading/trailing whitespace
    value = value.trim();

    if (value.length > 30) {
      this.emailError = 'Email must be 30 characters or less.';
      this.email = value.slice(0, 30); // truncate to 30 characters
    } else if (!value.includes('@') || !value.includes('.com') || /^\d+$/.test(value.split('@')[0])) {
      this.emailError = 'Invalid email format. Ensure it contains "@" and ends with ".com" and does not start with numbers.';
      this.email = value;
    } else {
      this.emailError = null;
      this.email = value;
    }

    input.value = this.email;
  }

  // VALIADTE CITY
  validateCity(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // remove any non-alphabetic characters
    value = value.replace(/[^a-zA-Z]/g, '');

    if (value.length > 30) {
      this.cityError = 'City name must be 30 characters or less.';
      this.city = value.slice(0, 30); // truncate to 30 characters
    } else {
      this.cityError = null;
      this.city = value;
    }

    input.value = this.city;
  }

  // VALIADTE STATE
  validateState(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // remove any non-alphabetic characters
    value = value.replace(/[^a-zA-Z]/g, '');

    if (value.length > 30) {
      this.stateError = 'State name must be 30 characters or less.';
      this.state = value.slice(0, 30); // truncate to 30 characters
    } else {
      this.stateError = null;
      this.state = value;
    }

    input.value = this.state;
  }

  // VALIADTE ZIPCODE
  validateZip(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // remove any non-digit characters
    value = value.replace(/\D/g, '');

    if (value.length > 6) {
      this.zipError = 'ZIP Code must be exactly 6 digits.';
      this.zip = value.slice(0, 6); // truncate to 6 digits
    } else if (value.length < 6) {
      this.zipError = 'ZIP Code must be exactly 6 digits.';
      this.zip = value; // allow shorter input until exactly 6 digits are entered
    } else {
      this.zipError = null;
      this.zip = value;
    }

    input.value = this.zip;
  }

  // BUTTON
  isFormInvalid(): boolean {
    return !!(this.nameError || this.mobileError || this.emailError || this.cityError || this.stateError || this.zipError);
  }
}
