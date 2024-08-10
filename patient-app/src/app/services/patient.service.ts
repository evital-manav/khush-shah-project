import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private httpClient: HttpClient) { }

  addPatient(data: any): Observable<any> {
    return this.httpClient.post('http://localhost:3001/patients', data);
  }

  updatePatient(id: number, data: any): Observable<any> {
    return this.httpClient.put(`http://localhost:3001/patients/${id}`, data);
  }

  getPatientList(): Observable<any> {
    return this.httpClient.get('http://localhost:3001/patients');
  }

  deletePatient(id: number): Observable<any> {
    return this.httpClient.delete(`http://localhost:3001/patients/${id}`);
  }
}
