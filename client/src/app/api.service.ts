import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TripHeader, User } from './model';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { environment } from './environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  subscribeNewsletter(email: string) {
    return this.http.post(`${this.baseUrl}/newsletter`, email);
  }

  signUp(userData: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, userData);
  }

  login(userData: User): Observable<any> {
    console.log("Attempting login with ", userData)
    return this.http.post(`${this.baseUrl}/login`, userData);
  }

  sendEmail(to: string): Observable<string> {
    const body = { to }; // Encapsulate 'to' in an object
    return this.http.post<string>(`${this.baseUrl}/email/send`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  inviteTripmate(to: string[], tripId: string): Observable<string> {
    const body = { to }; // Encapsulate 'to' in an object
    return this.http.post<string>(`${this.baseUrl}/email/inviteTripmate/${tripId}`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  chargeCreditCard(token: string, amount: number): Observable<any> {
    const payload = {
      token: token,
      amount: amount
    };
    return this.http.post(`${this.baseUrl}/payment/charge`, payload);
  }

  createTripHeader(tripHeader: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.authService.getToken()}` });
    return this.http.post(`${this.baseUrl}/createTripHeader`, tripHeader, { headers });
  }

  getTripHeaders(): Observable<TripHeader[]> {
    return this.http.get<TripHeader[]>(`${this.baseUrl}/getTripHeaders`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    });
  }

  getTripHeaderByTripId(tripId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    const url = `${this.baseUrl}/getTripHeader/${tripId}`;
    return this.http.get<TripHeader>(url, { headers: headers });
  }

  saveBudget(budget: any, tripId: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    return this.http.post(`${this.baseUrl}/saveBudget/${tripId}`, budget, { headers });
  }
  saveTripList(tripList: any) {
    return this.http.post(`${this.baseUrl}/saveTripList`, tripList);
  }
  saveTripHeader(tripHeader: any, tripId: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    return this.http.patch(`${this.baseUrl}/saveTripHeader/${tripId}`, tripHeader, { headers });
  }
  saveItinerary(itinerary: any, tripId: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    return this.http.post(`${this.baseUrl}/api/itinerary/saveItinerary/${tripId}`, itinerary, { headers }).pipe(
        tap({
            next: response => console.log('Itinerary saved successfully', response),
            error: error => console.error('Failed to save itinerary', error)
        }),
        catchError(error => {
            console.error('Error in saving itinerary:', error);
            return throwError(() => error);
        })
    );
  }

  deleteExpense(expense: any) {
    return this.http.delete(`${this.baseUrl}/deleteExpense`, expense);
  }

  deletePlace(placeId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/places/${placeId}`);
  }

  deleteTripHeader(placeId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteTripHeader/${placeId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    });
  }

}
