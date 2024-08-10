import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = 'http://localhost:3001/patients'; // JSON Server API of Patient-App for fetching patients from that project

  private customerNameSubject = new BehaviorSubject<string>(''); // default name
  customerName$ = this.customerNameSubject.asObservable();

  constructor(private http: HttpClient) {}

  // to set the customer's name
  setCustomerName(firstName: string): void {
    this.customerNameSubject.next(firstName);
  }

  // to get the current customer's name
  getCustomerName(): string {
    return this.customerNameSubject.value;
  }

  // to fetch name suggestions
  fetchCustomerNameSuggestions(query: string): Observable<any[]> {
    if (!query) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}?firstName_like=${query}`).pipe(
      map(response => response
        .map(customer => ({
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName
        }))
      )
    );
  }

  // to get fecthed customer details like name, email, blood group and so on..
  fetchCustomerDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
