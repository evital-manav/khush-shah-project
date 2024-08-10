import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://dev-api.evitalrx.in/v1/fulfillment/orders/place_order'; // PLACE ORDER API

  constructor(private http: HttpClient) {}

  // RUNNING API ON PLACE ORDER
  placeOrder(orderDetails: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderDetails);
  }
}
