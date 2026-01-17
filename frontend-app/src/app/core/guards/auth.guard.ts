import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface UserInfo {
    isSuperAdmin: boolean;
}

/**
 * Guard para rutas exclusivas de SuperAdmin
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check cached user first
    const currentUser = authService.currentUser();
    if (currentUser) {
        if (currentUser.isSuperAdmin) {
            return true;
        }
        router.navigate(['/home']);
        return false;
    }

    // If no cached user, check if we have a token at all
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        router.navigate(['/login']);
        return of(false);
    }

    // If no cached user, verify with backend
    return authService.me().pipe(
        map(user => {
            if (user.isSuperAdmin) {
                return true;
            }
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};

/**
 * Guard para rutas exclusivas de Root (Acceso total técnicos/devs)
 */
export const rootGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser();
    if (currentUser) {
        if (currentUser.isRoot || currentUser.isSuperAdmin) {
            return true;
        }
        router.navigate(['/home']);
        return false;
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        router.navigate(['/login']);
        return of(false);
    }

    return authService.me().pipe(
        map(user => {
            if (user.isRoot || user.isSuperAdmin) {
                return true;
            }
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};

/**
 * Guard para rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check cached user first to avoid unnecessary HTTP requests
    const currentUser = authService.currentUser();
    if (currentUser) {
        return true;
    }

    // If no cached user, check if we have a token at all
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        router.navigate(['/login']);
        return of(false);
    }

    // If we have a token, verify it with backend
    return authService.me().pipe(
        map(() => true),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};

/**
 * Guard para rutas públicas (Landing, Login, Register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Si no hay token en localStorage, asumimos que es invitado sin llamar al backend
    // Esto evita el 401 en consola para visitantes de la landing
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        return of(true);
    }

    return authService.me().pipe(
        map(() => {
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => of(true))
    );
};
