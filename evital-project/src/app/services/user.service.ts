import { Observable } from "rxjs";
import { Medicine, User } from "../interface/app.interface";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // JSON SERVER API URL -> json-server --watch db.json

  constructor(private http: HttpClient) {}

  // Get User by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // UPATE USER CART
  updateUserCart(userId: number, cart: Medicine[]): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, { cart });
  }
}
