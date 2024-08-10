import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private matSnackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string = 'ok') {
    this.matSnackBar.open(message, action,  {
      duration: 5000,
      verticalPosition: 'top',
    });
  }
}
