import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

interface UserInfo {
    isSuperAdmin: boolean;
}

export const superAdminGuard: CanActivateFn = (route, state) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    return http.get<UserInfo>('/api/auth/me').pipe(
        map(user => {
            if (user.isSuperAdmin) {
                return true;
            }
            // Redirect regular users to home
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};

export const authGuard: CanActivateFn = (route, state) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    return http.get('/api/auth/me').pipe(
        map(() => true),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};

export const guestGuard: CanActivateFn = (route, state) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    return http.get('/api/auth/me').pipe(
        map(() => {
            // If authenticated, go to home instead of public page
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => {
            // Not authenticated: allow seeing landing/login
            return of(true);
        })
    );
};
