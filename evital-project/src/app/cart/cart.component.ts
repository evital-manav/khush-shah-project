import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Medicine } from '../interface/app.interface';
import { CartService } from '../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PlaceOrderDialog } from '../place-order-dialog/place-order-dialog.component';
import { CustomerService } from '../services/customer.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../auth/auth.service';
import { OrderService } from '../services/order.service';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, map, Observable, of } from 'rxjs';
import { debounce, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { OrderConfirmationComponent } from '../order-confirmation/order-confirmation.component';

import { format } from 'date-fns';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Medicine[] = [];
  overallDiscount: number = 0; // Overall discount percentage

  // Total Bill Variables
  totalBillBeforeDiscount: number = 0;
  totalBillAfterItemDiscount: number = 0;
  totalBillAfterOverallDiscount: number = 0;
  totalDiscountAmount: number = 0;

  todayDate: Date = new Date(); // Today's date
  customerName: string = '';
  inputCustomerName: string = ''; // Bind to input field

  // OTHERS - CUSTOMER
  customerNameControl = new FormControl();
  customerNameSuggestions: any[] = [];
  selectedCustomer: any = null; // To store detailed customer data\

  errorMessage: string | undefined;

  // KEY & MOUSE EVENTS
  highlightedIndex: number = -1;
  @ViewChild('suggestionsList', { static: false }) suggestionsList: ElementRef | undefined;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cartService: CartService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private authService: AuthService,
    private http: HttpClient,) { }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cart = items;
      this.calculateTotalBill(); // Calculate total on cart update
    });

    // Customer name update
    this.customerService.customerName$.subscribe(
      name => {
        this.customerName = name;
        this.inputCustomerName = name; // Update when customer name changes
      }
    );

    // OTHERS - CUSTOMER
    this.customerNameControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.customerService.fetchCustomerNameSuggestions(value).subscribe(suggestions => {
        this.customerNameSuggestions = suggestions;
      });
    });
  }

  // OTHERS - CUSTOMER
  selectCustomerName(name: string): void {
    const selected = this.customerNameSuggestions.find(suggestion => suggestion.firstName === name);
    if (selected) {
      this.customerService.fetchCustomerDetails(selected.id).subscribe(details => {
        this.selectedCustomer = details;
        this.customerName = `${details.firstName} ${details.lastName}`;
        this.inputCustomerName = this.customerName;
        this.customerNameControl.setValue(this.customerName);
        this.customerNameSuggestions = [];
      });
    }
  }

  removeFromCart(medicine: Medicine): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to remove this item from the cart?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cartService.removeFromCart(medicine);
        this.calculateTotalBill(); // Recalculate total bill after removing an item
        this.snackBar.open('Item removed from cart.', 'Ok', { duration: 2000 });
      }
    });
  }

  increaseQuantity(medicine: Medicine): void {
    medicine.quantity++;
    this.updateCart(); // Update cart and recalculate total bill
  }

  decreaseQuantity(medicine: Medicine): void {
    if (medicine.quantity > 1) {
      medicine.quantity--;
      this.updateCart(); // Update cart and recalculate total bill
    }
  }

  updateCart(): void {
    this.cartService.updateCart(this.cart);
    this.calculateTotalBill(); // Recalculate total bill after updating cart
  }

  calculateTotalBill() {
    this.totalBillBeforeDiscount = this.cart.reduce((acc, item) => acc + this.getAmount(item), 0);

    // to apply item-wise discounts
    this.totalBillAfterItemDiscount = this.cart.reduce((acc, item) => acc + this.getDiscountedAmount(item), 0);

    // to calculate total discount amount
    this.totalDiscountAmount = this.totalBillBeforeDiscount - this.totalBillAfterItemDiscount;

    // to apply overall discount
    const overallDiscountAmount = this.totalBillAfterItemDiscount * this.overallDiscount / 100;
    this.totalBillAfterOverallDiscount = this.totalBillAfterItemDiscount - overallDiscountAmount;

    // to add overall discount amount to the total discount amount
    this.totalDiscountAmount += overallDiscountAmount;
  }

  getAmount(medicine: Medicine): number {
    return medicine.price * medicine.quantity;
  }

  getDiscountedAmount(medicine: Medicine): number {
    const discount = medicine.discount || 0;
    const amount = this.getAmount(medicine);
    const discountAmount = (amount * discount) / 100;
    return amount - discountAmount;
  }

  updateCustomerName(): void {
    this.customerService.setCustomerName(this.inputCustomerName);
  }

  openPlaceOrderDialog(): void {
    const dialogRef = this.dialog.open(PlaceOrderDialog, {
      width: '300px',
      data: { cart: this.cart, totalBill: this.totalBillAfterOverallDiscount }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'place') {
        this.placeOrder(); // Place order only if the result is => 'place'
      }
    });
  }

  // to handle batch number input
  onBatchNumberInput(event: Event, medicine: Medicine): void {
    const input = event.target as HTMLInputElement;
    let cleanedValue = input.value
      .toUpperCase() // Convert to uppercase
      .replace(/[^A-Z0-9-]/g, '') // remove non-alphanumeric and non-hyphen characters

    cleanedValue = cleanedValue.slice(0, 10); // limit to 10 characters

    input.value = cleanedValue;
    medicine.batch_number = cleanedValue;

    this.updateCart();
  }

  // to handle expiry date input
  onExpiryDateInput(event: Event, medicine: Medicine): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/\D/g, '');

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }

    if (value.length >= 2 && parseInt(value.slice(0, 2), 10) > 12) {
      value = `12/${value.slice(3)}`;
    }

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    input.value = value;
    medicine.expiry_date = value;

    // Validate the expiry date
    const validation = this.validateExpiryDate(value);

    if (!validation.isValid) {
      // Set error message or perform actions based on validation
      this.errorMessage = validation.message;
    } else {
      // Clear error message if date is valid
      this.errorMessage = validation.message;
    }

    this.updateCart();
  }

  // FORMATING DATE (MM/YY)
  getFormattedExpiryDate(expiry_date: string): string {
    if (!expiry_date) return '';

    // extracting MM and YY from expiry_date
    const parts = expiry_date.split('/');
    if (parts.length === 1) {
      // only month is provided, default year to "00"
      return `${parts[0].padStart(2, '0')}/00`;
    } else if (parts.length === 2) {
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
    }

    return expiry_date;
  }

  // ================> EXPIRY DATE VALIDATION <================
  validateExpiryDate(expiry_date: string): { isValid: boolean, message?: string } {
    const today = new Date();
    const currentYear = today.getFullYear() % 100; // last two digits of the year
    const currentMonth = today.getMonth() + 1; // months are 0-indexed

    const parts = expiry_date.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    // Check year validity
    if (year < currentYear) {
      return { isValid: false, message: 'Expiry year cannot be less than the current year.' };
    }

    // Check month validity if the year is the current year
    if (year === currentYear && month < currentMonth) {
      return { isValid: false, message: 'Expiry month cannot be less than the current month in the current year.' };
    }

    // expiry threshold (current month + 4 months)
    const expiryThreshold = new Date(today.getFullYear(), today.getMonth() + 5, 0); // End of the month + 4 months i.e. August + next 4 months
    const expiryDate = new Date(`20${year}-${month}-01`);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    if (expiryDate <= expiryThreshold) {
      return { isValid: true, message: 'Expiry date is approaching soon.' };
    }

    return { isValid: true };
  }

  // to handle quantity input
  onQuantityInput(event: Event, medicine: Medicine): void {
    const input = event.target as HTMLInputElement;
    let cleanedValue = input.value
      .replace(/\D/g, '') // remove all non-digit characters
      .slice(0, 4); // limit to 4 digits

    input.value = cleanedValue;
    medicine.quantity = Number(cleanedValue);

    this.updateCart();
  }

  // to handle item discount input
  onDiscountInput(event: Event, medicine: Medicine): void {
    const input = event.target as HTMLInputElement;
    let cleanedValue = input.value
      .replace(/\D/g, '') // remove all non-digit characters
      .slice(0, 2); // limit to 2 digits only

    input.value = cleanedValue;
    medicine.discount = Number(cleanedValue);

    this.calculateTotalBill();
  }

  // to handle overall discount input
  onOverallDiscountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleanedValue = input.value
      .replace(/\D/g, '') // remove all non-digit characters
      .slice(0, 2); // limit to 2 digits only

    input.value = cleanedValue;
    this.overallDiscount = Number(cleanedValue);

    this.calculateTotalBill(); // recalculate total bill after updating overall discount
  }

  // Validation Methods
  isBatchValid(medicine: Medicine): boolean {
    return !!medicine.batch_number;
  }

  isExpiryDateValid(medicine: Medicine): boolean {
    return !!medicine.expiry_date;
  }

  isQuantityValid(medicine: Medicine): boolean {
    return medicine.quantity > 0;
  }

  isCustomerNameValid(): boolean {
    return this.customerName.trim().length > 0;
  }

  // EXTRACTING MEDICINE_ID & QUANTITY FROM PAYLOAD
  transformCartPayload(): { medicine_id: string, quantity: number }[] {
    return this.cart.map(item => ({
      medicine_id: item.medicine_id,
      quantity: item.quantity
    }));
  }

  // SEND ONLY MEDICINE_ID & QUANTITY
  sendTransformedPayload(): void {
    const payload = this.transformCartPayload();

    this.http.post("https://dev-api.evitalrx.in/v1/fulfillment/orders/place_order", payload)
      .subscribe(
        response => {
          console.log('Successfully sent data to server', response);
        },
        error => {
          console.error('Error sending data to server', error);
        }
      );
  }

  // OPEN DIALOG ON CLICK OF PLACE ORDER
  openOrderDetailsDialog(): Observable<any> {
    const dialogRef = this.dialog.open(PlaceOrderDialog, {
      width: '400px',
      data: {
        address: '',
        city: '',
        state: ''
      }
    });

    return dialogRef.afterClosed();
  }

  placeOrder(): void {
    if (!this.isCustomerNameValid()) {
      this.snackBar.open('Customer name is required.', 'Ok', { duration: 2000 });
      return;
    }

    for (let medicine of this.cart) {
      if (!this.isBatchValid(medicine)) {
        this.snackBar.open(`Batch number is required for ${medicine.medicine_name}.`, 'Ok', { duration: 2000 });
        return;
      }

      if (!this.isExpiryDateValid(medicine)) {
        this.snackBar.open(`Expiry date is required for ${medicine.medicine_name}.`, 'Ok', { duration: 2000 });
        return;
      }

      const expiryValidation = this.validateExpiryDate(medicine.expiry_date);
      if (!expiryValidation.isValid) {
        this.snackBar.open(`Expiry date issue for ${medicine.medicine_name}: ${expiryValidation.message}`, 'Ok', { duration: 2000 });
        return;
      }

      if (!this.isQuantityValid(medicine)) {
        this.snackBar.open(`Quantity must be greater than 0 for ${medicine.medicine_name}.`, 'Ok', { duration: 2000 });
        return;
      }
    }

    // calculate the total amount from the cart items
    const totalAmount = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // open dialog to collect address, city, state, and zipcode
    const dialogRef = this.dialog.open(PlaceOrderDialog, {
      width: '300px',
      data: {
        message: 'Do you want to place the order?',
        defaultZipcode: this.selectedCustomer?.zipcode || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'place') {
        const orderDetails = {
          apikey: environment.apikey,
          // 'wFIMP75eG1sQEh8vVAdXykgzF4mLhDw3',
          items: JSON.stringify(this.transformCartPayload()),
          delivery_type: 'delivery',
          patient_name: this.customerName,
          mobile: this.selectedCustomer?.mobile || '',
          address: result.address,
          city: result.city,
          state: result.state,
          zipcode: result.zipcode || this.selectedCustomer?.zipcode || '380013', // default to customer zipcode or fallback
          full_address: `${result.address}, ${result.city}, ${result.state}, ${result.zipcode || this.selectedCustomer?.zipcode || '380013'}`
        };

        // API request to place order
        this.http.post('https://dev-api.evitalrx.in/v1/fulfillment/orders/place_order', orderDetails)
          .subscribe(
            response => {
              this.cartService.clearCart();
              this.inputCustomerName = '';
              this.customerName = '';
              const responseData = response as any;

              // open order confirmation dialog with total amount
              this.dialog.open(OrderConfirmationComponent, {
                width: '300px',
                data: {
                  order_id: responseData.data?.order_id,
                  order_number: responseData.data.order_number,
                  total: totalAmount,
                  datetime: responseData.datetime
                }
              });
            },
            error => {
              this.snackBar.open('Failed to place order. Please try again later.', 'Ok', { duration: 2000 });
            }
          );
      } else {
        this.snackBar.open('Order was not placed.', 'Ok', { duration: 2000 });
      }
    });
  }

  // ADD PATIENT => TO PATIENT APP PROJECT
  addPatient() {
    window.location.href = 'http://localhost:5000/';
  }

  // KEYBOARD EVENTS FOR CUSTOMER NAME SUGGESTION
  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    this.onKeydown(event);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.suggestionsList && !this.suggestionsList.nativeElement.contains(event.target)) {
      this.customerNameSuggestions = [];
    }
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        this.onArrowDown(event);
        break;
      case 'ArrowUp':
        this.onArrowUp(event);
        break;
      case 'Enter':
        this.onEnter(event);
        break;
      case 'Escape':
        this.onEscape(event);
        break;
    }
  }

  onArrowUp(event: KeyboardEvent) {
    if (this.customerNameSuggestions.length > 0) {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex + 1) % this.customerNameSuggestions.length;
    }
  }

  onArrowDown(event: KeyboardEvent) {
    if (this.customerNameSuggestions.length > 0) {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex - 1 + this.customerNameSuggestions.length) % this.customerNameSuggestions.length;
    }
  }

  onEnter(event: KeyboardEvent) {
    if (this.highlightedIndex >= 0 && this.highlightedIndex < this.customerNameSuggestions.length) {
      event.preventDefault();
      const selectedSuggestion = this.customerNameSuggestions[this.highlightedIndex];
      this.selectCustomerName(selectedSuggestion.firstName);
    }
  }

  onEscape(event: KeyboardEvent) {
    if (this.customerNameSuggestions.length > 0) {
      event.preventDefault();
      this.customerNameSuggestions = []; // clear the suggestions
      this.highlightedIndex = -1; // reset highlighted index
    }
  }
}
