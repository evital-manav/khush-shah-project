import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css'],
  providers: [DatePipe]
})
export class OrderConfirmationComponent {
  formattedDate: string | null;
  formattedTime: string | null;

  constructor(
    public dialogRef: MatDialogRef<OrderConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public orderDetails: any,
    private datePipe: DatePipe
  ) {
    // extracting and format the date and time
    const dateTime = new Date(orderDetails.datetime);
    this.formattedDate = this.datePipe.transform(dateTime, 'MMMM d, yyyy');
    this.formattedTime = this.datePipe.transform(dateTime, 'h:mm a');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
