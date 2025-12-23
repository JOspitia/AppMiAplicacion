import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
    usernameOrEmail?: string;
    password?: string;
}

export interface RegisterRequest {
    username?: string;
    email?: string;
    firstName?: string;
    firstSurname?: string;
    password?: string;
}

export interface User {
    message: string;
    role: string;
    companies?: Array<{ id: string, name: string, nit: string }>;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    // Using relative URL which will be proxied
    private apiUrl = '/api/auth';

    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
            tap(user => {
                console.log('Login successful', user);
            })
        );
    }

    register(userData: RegisterRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, userData);
    }

    logout() {
        return this.http.post(`${this.apiUrl}/logout`, {});
    }

    refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/refreshtoken`, {}, { withCredentials: true });
    }

    selectCompany(companyId: string): Observable<any> {
        return this.http.post('/api/companies/select', { companyId });
    }
}
