import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CartService } from '../services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = 'http://localhost:3000/users'; // JSON SERVER URL AS API
  private loggedIn = new BehaviorSubject<boolean>(this.hasUser());
  private currentUser: any = this.loadUserFromLocalStorage();

  private readonly AUTO_LOGOUT_INTERVAL = 10 * 60 * 60 * 1000; // 10 hours => Can Change Accordingly
  private logoutInterval: any;

  constructor(private http: HttpClient,
              private cartService: CartService) {
    this.startAutoLogoutTimer();
  }

  // LOGIN - FUNCTION
  login(mobile: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?mobile=${mobile}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          this.loggedIn.next(true);
          this.currentUser = users[0];
          this.saveUserToLocalStorage(users[0]);
          localStorage.setItem('userEmail', users[0].email); // Storing user's email in local storage
          this.cartService.loadCart();
          return true;
        }
        this.loggedIn.next(false);
        return false;
      }),
      catchError(() => {
        this.loggedIn.next(false);
        return of(false);
      })
    );
  }

  // REGISTER - FUNCTION
  register(name: string, mobile: string, password: string, email: string, address: string, city: string, state: string, zip: string): Observable<boolean> {
    const newUser = {
      name,
      mobile,
      password,
      email,
      address,
      city,
      state,
      zip,
      cart: [] // Added cart property with an empty array
    };
    return this.http.post<any>(this.apiUrl, newUser).pipe(
      map(() => {
        this.saveUserToLocalStorage(newUser);
        localStorage.setItem('userEmail', email); // Storing user's email in local storage
        return true;
      }),
      catchError(() => of(false))
    );
  }

  // LOGOUT FUNCTIONALITY
  logout(): void {
    this.loggedIn.next(false);
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
  }

  // TO CHECK IF USER LOGGEDIN
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // GET CURRENT LOGGEDIN USER
  getCurrentUser(): any {
    return this.currentUser;
  }

  // GET CURRENT LOGGEDIN USERNAME
  getCurrentUserName(): string {
    return this.currentUser ? this.currentUser.name : '';
  }

  // SAVING USER TO LOCALSTORAGE
  private saveUserToLocalStorage(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // LOADING USER FROM LOCALSTORAGE
  private loadUserFromLocalStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private hasUser(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUserId(): string | null {
    return this.currentUser ? this.currentUser.id : null;
  }

  // LOGOUT TIMER
  private startAutoLogoutTimer() {
    this.resetAutoLogoutTimer();
  }

  private resetAutoLogoutTimer() {
    this.clearAutoLogoutTimer();
    this.logoutInterval = setInterval(() => {
      this.logout();
    }, this.AUTO_LOGOUT_INTERVAL);
  }

  private clearAutoLogoutTimer() {
    if (this.logoutInterval) {
      clearInterval(this.logoutInterval);
      this.logoutInterval = null;
    }
  }

  ngOnDestroy() {
    this.clearAutoLogoutTimer();
  }
}
