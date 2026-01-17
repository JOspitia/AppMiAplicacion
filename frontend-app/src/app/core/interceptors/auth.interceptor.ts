import { HttpErrorResponse, HttpInterceptorFn, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// --- ESTADO GLOBAL DEL INTERCEPTOR (MUTEX) ---
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

// --- RUTAS PÚBLICAS (no requieren refresh token) ---
const PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refreshtoken',
    '/api/auth/logout',
    '/api/auth/me' // Importante para que guestGuard no dispare refresh al dar 401
];

/**
 * Verifica si una URL corresponde a un endpoint público que no debe
 * intentar refresh token automático en caso de 401.
 */
function isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const http = inject(HttpClient);
    const router = inject(Router);

    // 1. Leer el token SIEMPRE antes de cada petición (garantiza frescura)
    const token = localStorage.getItem('auth_token');

    // 2. Clonar la petición con credenciales Y token si existe
    let authReq = req.clone({
        withCredentials: true,
        setHeaders: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    // Debug: Solo en desarrollo
    if (!token && !isPublicEndpoint(req.url)) {
        console.warn('[AuthInterceptor] No token found for protected endpoint:', req.url);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse) {

                // ============================================================
                // CASO A: 403 Forbidden -> Renovar CSRF token
                // SOLUCIÓN: Leer token directamente del JSON
                // ============================================================
                if (error.status === 403 && !req.url.includes('/api/auth/login')) {
                    // Evitar loop infinito si ya reintentamos
                    if (req.headers.has('X-CSRF-Retry')) {
                        // console.error('[AuthInterceptor] 403: Ya se reintentó con CSRF. Abortando.');
                        return throwError(() => error);
                    }

                    // console.log('[AuthInterceptor] 403 detectado. Renovando CSRF con Solución Nuclear...');

                    // Llamar /api/auth/me que ahora retorna el token CSRF en JSON
                    return http.get<any>('/api/auth/me', { withCredentials: true }).pipe(
                        switchMap((response) => {
                            // Leer CSRF token directamente del JSON (¡Infalible!)
                            const freshToken = response.csrfToken;

                            if (!freshToken) {
                                // console.error('[AuthInterceptor] /api/auth/me no retornó csrfToken. Forzando logout.');
                                authService.logout().subscribe();
                                router.navigate(['/login']);
                                return throwError(() => new Error('CSRF token not found in /me response'));
                            }

                            // console.log('[AuthInterceptor] CSRF renovado desde JSON:', freshToken);

                            // Reintentar con el nuevo token
                            const retryReq = authReq.clone({
                                headers: req.headers
                                    .set('X-XSRF-TOKEN', freshToken)
                                    .set('X-CSRF-Retry', 'true')
                            });

                            return next(retryReq);
                        }),
                        catchError((csrfError) => {
                            // console.error('[AuthInterceptor] Falló renovación CSRF:', csrfError);
                            return throwError(() => csrfError);
                        })
                    );
                }

                // ============================================================
                // CASO B: 401 Unauthorized -> Refresh Token
                // ============================================================
                if (error.status === 401) {

                    // Evitar refresh en endpoints públicos
                    if (isPublicEndpoint(req.url)) {
                        // console.log('[AuthInterceptor] 401 en endpoint público. NO se intentará refresh.');
                        return throwError(() => error);
                    }

                    // Evitar loop si ya reintentamos
                    if (req.headers.has('X-Interceptor-Retry')) {
                        // console.error('[AuthInterceptor] 401: Reintento falló. Haciendo logout.');
                        authService.logout().subscribe();
                        router.navigate(['/login']);
                        return throwError(() => error);
                    }

                    // Mutex: solo un refresh a la vez
                    if (!isRefreshing) {
                        // console.log('[AuthInterceptor] 401 detectado. Iniciando Refresh Token...');
                        isRefreshing = true;
                        refreshTokenSubject.next(null);

                        return authService.refreshToken().pipe(
                            switchMap(() => {
                                // console.log('[AuthInterceptor] Refresh exitoso. Reintentando petición...');
                                isRefreshing = false;
                                refreshTokenSubject.next(true);

                                const retryReq = authReq.clone({
                                    headers: req.headers.set('X-Interceptor-Retry', 'true')
                                });

                                return next(retryReq);
                            }),
                            catchError((refreshError) => {
                                // console.error('[AuthInterceptor] Refresh falló:', refreshError);
                                isRefreshing = false;
                                refreshTokenSubject.next(false);

                                // Logout solo si el refresh token también está expirado
                                authService.logout().subscribe({
                                    complete: () => router.navigate(['/login'])
                                });

                                return throwError(() => refreshError);
                            }),
                            finalize(() => {
                                isRefreshing = false;
                            })
                        );

                    } else {
                        // Si ya hay un refresh en progreso, esperar el resultado
                        // console.log('[AuthInterceptor] Refresh en progreso. Esperando...');
                        return refreshTokenSubject.pipe(
                            filter(result => result !== null),
                            take(1),
                            switchMap(success => {
                                if (success) {
                                    const retryReq = authReq.clone({
                                        headers: req.headers.set('X-Interceptor-Retry', 'true')
                                    });
                                    return next(retryReq);
                                }
                                return throwError(() => error);
                            })
                        );
                    }
                }
            }

            return throwError(() => error);
        })
    );
};
