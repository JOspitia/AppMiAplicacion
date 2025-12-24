import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

interface UserInfo {
    isSuperAdmin: boolean;
}

/**
 * Guard para rutas exclusivas de SuperAdmin
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    return http.get<UserInfo>('/api/auth/me').pipe(
        map(user => {
            if (user.isSuperAdmin) {
                return true;
            }
            // Redirigir usuarios regulares a home
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

/**
 * Guard para rutas públicas (Landing, Login, Register)
 * Redirige a /home si el usuario YA está autenticado.
 * IMPORTANTE: Captura silenciosamente el 401 sin disparar el interceptor.
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const http = inject(HttpClient);
    const router = inject(Router);

    return http.get('/api/auth/me').pipe(
        map(() => {
            // Si está autenticado, redirigir a home
            router.navigate(['/home']);
            return false;
        }),
        catchError((error) => {
            // Si recibe 401 (no autenticado), permitir acceso a la ruta pública
            // NO propagar el error para evitar que el interceptor intente refresh
            return of(true);
        })
    );
};
