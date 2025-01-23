import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserRegistration } from '../models/userRegistration';
import { User } from '../models/user';
import { UserLogin } from '../models/userLogin';
import { TokenResponse } from '../models/tokenResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    if(isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(!!this.getToken());
    }
  }

  register(userData: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData)
  }

  login(credentials: UserLogin): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
