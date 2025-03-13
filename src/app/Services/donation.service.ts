import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, tap } from 'rxjs';

export interface Donation {
  id?: number;
  itemName: string;
  description: string;
  location: string;
  imageUrl?: string;
  contact?:string;
}

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'https://localhost:7276/api';

  constructor(private http: HttpClient) {}

  getDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/Donation`)
      .pipe(
        catchError(error => {
          console.error('Error fetching donations:', error);
          return throwError(() => new Error('Failed to load donations. Please try again.'));
        })
      );
  }

  submitDonation(payload: FormData): Observable<Donation[]> {
    return this.http.post<Donation[]>(`${this.apiUrl}/Donation/create`, payload)
      .pipe(
        tap(() => console.log('Donation submitted successfully')),
        catchError(error => {
          console.error('Error submitting donation:', error);
          return throwError(() => new Error('Failed to submit donation. Please try again.'));
        })
      );
  }
}
