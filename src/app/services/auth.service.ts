import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserRegistration } from '../models/userRegistration';
import { User } from '../models/user';
import { UserLogin } from '../models/userLogin';
import { TokenResponse } from '../models/tokenResponse';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkTokenValidity();
    }
  }

  checkTokenValidity(): void {
    const token = this.getToken();

    if (!token) {
      this.isAuthenticatedSubject.next(false);
      return;
    }

    try {
      const decodeToken: any = jwtDecode(token);
      const isValid = decodeToken.exp * 1000 >  Date.now();
      this.isAuthenticatedSubject.next(isValid);

      if(!isValid){
        this.logout();
      }
    } catch {
      this.logout();
    }
  }

  validateToken():Observable<boolean>{
    const token = this.getToken();
    if(!token) return of(false);

    return this.http.post<{ valid: boolean}>(`${this.API_URL}/validate`, { token }).pipe(
      map(response => {
        const isValid = response.valid;
        this.isAuthenticatedSubject.next(isValid);
        if(!isValid) this.logout();
        return isValid;
      }),
      catchError(()=>{
        this.logout();
        return of(false);
      })
    );
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
