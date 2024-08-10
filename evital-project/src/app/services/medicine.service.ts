import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchMedicinesResponse, SearchMedicinesPayload } from './../interface/app.interface';

// Interface for API for Fetching Detils (REQ)
interface MedicineDetailsPayload {
  apikey: string;
  medicine_id: string;
}

// Interface for API for Getting if Medicine Stock Available or Not (RES)
interface MedicineAvailabilityResponse {
  status_code: string;
  status_message: string;
  datetime: string;
  data: {
    availability: Array<{
      medicine_id: string;
      in_stock: string;
      medicine_name: string;
      manufacturer_name: string;
      content: string;
      packing_size: string;
      mrp: number;
      alternatives?: Array<{
        medicine_id: string;
        medicine_name: string;
        mrp: number;
        packing_size: string;
        manufacturer_name: string;
        content: string;
      }>;
    }>;
    latitude: number;
    longitude: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MedicinesService {
  private baseUrl = 'https://dev-api.evitalrx.in/v1/fulfillment/'; // API URL
  private apikey = environment.apikey;

  constructor(private httpClient: HttpClient) { }

  // SEARCHING MEDICINE API FROM ELASTIC SEARCH
  searchMedicines(searchstring: string): Observable<SearchMedicinesResponse> {
    const url = `${this.baseUrl}medicines/search`;
    const payload: SearchMedicinesPayload = {
      searchstring: searchstring,
      apikey: this.apikey
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<SearchMedicinesResponse>(url, payload, { headers });
  }

  // FOR GETTING THE SEARCHED MEDICINE DETAILS
  getMedicineDetails(medicineId: string): Observable<any> {
    const url = `${this.baseUrl}medicines/view`;
    const payload: MedicineDetailsPayload = {
      apikey: this.apikey,
      medicine_id: medicineId
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<any>(url, payload, { headers });
  }

  // CHECKING THE AVAILABILITY OF MEDICINE BY RUNNING CHECKOUT API
  checkMedicineAvailability(medicineIds: string[], latitude: number, longitude: number, distance: number): Observable<MedicineAvailabilityResponse> {
    const url = `${this.baseUrl}orders/checkout`;
    const payload = {
      apikey: this.apikey,
      medicine_ids: JSON.stringify(medicineIds),
      latitude: latitude,
      longitude: longitude,
      distance: distance
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<MedicineAvailabilityResponse>(url, payload, { headers });
  }
}
