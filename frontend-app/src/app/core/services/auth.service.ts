import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

export interface LoginRequest {
    username?: string;
    password?: string;
    clientHash?: string;
}

export interface RegisterRequest {
    username?: string;
    email?: string;
    firstName?: string;
    firstSurname?: string;
    secondSurname?: string;
    password?: string;
}

export interface User {
    token?: string; // JWT token
    message: string;
    role: string;
    companies?: Array<{
        id: string;
        name: string;
        nit: string;
        logoUrl?: string | null;
        primaryColor?: string | null;
    }>;
    requirePasswordChange?: boolean;
    isSuperAdmin?: boolean;
    permissions?: string[];
}


@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    // Using relative URL which will be proxied
    private apiUrl = '/api/auth';

    currentUser = signal<User | null>(null);

    hasPermission(permission: string): boolean {
        const user = this.currentUser();
        if (!user) return false;
        if (user.isSuperAdmin) return true;
        return user.permissions?.includes(permission) ?? false;
    }

    login(credentials: LoginRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
            map(user => {
                console.log('Login successful', user);
                // Set user FIRST (synchronously)
                this.currentUser.set(user);
                // Then save token to localStorage
                if (user.token) {
                    localStorage.setItem('auth_token', user.token);
                }
                // Return user for the component to use
                return user;
            })
        );
    }

    me(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            map(user => {
                this.currentUser.set(user);
                // Update token if provided (Hybrid Strategy)
                if (user.token) {
                    localStorage.setItem('auth_token', user.token);
                }
                return user;
            })
        );
    }

    register(userData: RegisterRequest): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, userData);
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser.set(null);
        return this.http.post(`${this.apiUrl}/logout`, {});
    }

    refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/refreshtoken`, {}, { withCredentials: true });
    }

    selectCompany(companyId: string): Observable<any> {
        return this.http.post('/api/companies/select', { companyId });
    }

    verify(token: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify`, { token });
    }

    resendVerification(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/resend-verification`, { email });
    }
}
