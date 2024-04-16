import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;
  private isLoggedInSource = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSource.asObservable();

  constructor(private http: HttpClient, private route: Router) {
    const token = localStorage.getItem('token');
    this.isLoggedInSource.next(!!token);
  }

  login(userData: User): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, userData, { responseType: 'text'})
      .pipe(
        tap((token: string) => {
          localStorage.setItem('token', token);
          this.isLoggedInSource.next(true);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSource.next(false);
    this.route.navigate(['/']);
  }

  isAuthenticated() {
    return this.isLoggedIn$;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
