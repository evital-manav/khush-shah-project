import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Medicine } from '../interface/app.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/users'; // URL for json-server => db.json - execute: json-server --watch db.json
  private cartItems = new BehaviorSubject<Medicine[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private userService: UserService) {
    this.loadCart();
  }

  // Getting Email of Current LoggedIn User and stroing as token
  private getLoggedInUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  // Getting User by Email (fetched)
  private getUserByEmail(email: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => users.length ? users[0] : null),
      catchError(error => {
        return of(null);
      })
    );
  }

  // Update the User Cart
  // private updateUserCart(userId: number, cart: Medicine[]): Observable<any> {
  //   return this.http.patch<any>(`${this.apiUrl}/${userId}`, { cart }).pipe(
  //     catchError(error => {
  //       return of(null);
  //     })
  //   );
  // }
  private updateUserCart(userId: number, cart: Medicine[]): Observable<any> {
    return this.userService.updateUserCart(userId, cart).pipe(
      catchError(error => of(null))
    );
  }

  // Adding products to cart and checking validations if user logged in & if product is already in cart
  addToCart(medicine: Medicine): void {
    const email = this.getLoggedInUserEmail();
    if (!email) {
      return;
    }

    this.getUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const userId = user.id;
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find(item => item.medicine_id === medicine.medicine_id);

        if (existingItem) {
          this.snackBar.open(`ERROR! ${medicine.medicine_name} is already in the cart!`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        } else {
          medicine.quantity = 1;
          const updatedItems = [...currentItems, medicine];
          this.cartItems.next(updatedItems);
          return this.updateUserCart(userId, updatedItems);
        }
      }),
      catchError(error => {
        return of(null);
      })
    ).subscribe();
  }

  // Removing items from Cart
  removeFromCart(medicine: Medicine): void {
    const email = this.getLoggedInUserEmail();
    if (!email) {
      return;
    }

    this.getUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const userId = user.id;
        const updatedCart = this.cartItems.value.filter(item => item.medicine_id !== medicine.medicine_id);
        this.cartItems.next(updatedCart);
        return this.updateUserCart(userId, updatedCart);
      }),
      catchError(error => {
        return of(null);
      })
    ).subscribe();
  }

  // Updating Cart
  updateCart(updatedCart: Medicine[]): void {
    const email = this.getLoggedInUserEmail();
    if (!email) {
      return;
    }

    this.getUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const userId = user.id;
        this.cartItems.next(updatedCart);
        return this.updateUserCart(userId, updatedCart);
      }),
      catchError(error => {
        return of(null);
      })
    ).subscribe();
  }

  // Clearing the Cart after Order Placed
  clearCart(): void {
    const email = this.getLoggedInUserEmail();
    if (!email) {
      return;
    }

    this.getUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const userId = user.id;
        this.cartItems.next([]);
        return this.updateUserCart(userId, []);
      }),
      catchError(error => {
        return of(null);
      })
    ).subscribe();
  }

  // Loading the Cart => onInit
  loadCart(): void {
    const email = this.getLoggedInUserEmail();
    if (!email) {
      this.cartItems.next([]);
      return;
    }

    this.getUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const cart = user.cart || [];
        this.cartItems.next(cart);
        return of(cart);
      }),
      catchError(error => {
        this.cartItems.next([]);
        return of([]);
      })
    ).subscribe();
  }
}
