import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-place-order-dialog',
  templateUrl: './place-order-dialog.component.html',
  styleUrls: ['./place-order-dialog.component.css']
})
export class PlaceOrderDialog {
  address: string = '';
  city: string = '';
  state: string = '';
  zipcode: string = '';
  defaultZipcode: string;

  constructor(
    public dialogRef: MatDialogRef<PlaceOrderDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
  ) {
    this.defaultZipcode = data.defaultZipcode || '';
  }

  onNoClick(): void {
    this.dialogRef.close('cancel');
  }

  onPlaceOrder(): void {
    if (this.address && this.city && this.state) {
      this.dialogRef.close({
        action: 'place',
        address: this.address,
        city: this.city,
        state: this.state,
        zipcode: this.zipcode || this.defaultZipcode
      });
    } else {
      this.snackBar.open('Please fill out all fields.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
