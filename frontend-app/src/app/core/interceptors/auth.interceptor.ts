import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http'; // use HttpClient directly to avoid circular DI
import { Router } from '@angular/router';

// --- ESTADO GLOBAL DEL INTERCEPTOR (MUTEX) ---
// Estas variables viven fuera de la función para mantener el estado entre llamadas
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const http = inject(HttpClient); // direct HTTP client to avoid circular DI with ProfileService
    const router = inject(Router);

    // 1. Asegurar que siempre enviamos credenciales (Cookies)
    // Esto es vital para que viajen el JWT y el XSRF-TOKEN
    const authReq = req.clone({ withCredentials: true });

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse) {

                // CASO A: 403 Forbidden -> Probablemente CSRF
                if (error.status === 403) {
                    // Avoid re-trying profile/me itself or infinite loops
                    if (req.url.includes('/api/profile/me') || req.headers.has('X-CSRF-Retry')) {
                        return throwError(() => error);
                    }

                    console.log('[AuthInterceptor] Detectado 403. Intentando recuperar cookie CSRF (GET /api/profile/me)...');
                    return http.get('/api/profile/me', { withCredentials: true }).pipe(
                        switchMap(() => {
                            // Reintentamos la petición original marcándola para no volver a entrar aquí
                            const retryReq = authReq.clone({
                                headers: req.headers.set('X-CSRF-Retry', 'true')
                            });
                            return next(retryReq);
                        }),
                        catchError((err) => {
                            // Si falla la recuperación de cookie, devolvemos el error original
                            return throwError(() => err);
                        })
                    );
                }

                // CASO B: 401 Unauthorized -> intentar refresh token
                if (error.status === 401) {
                    // Evitar loop si ya se reintentó
                    if (req.headers.has('X-Interceptor-Retry')) {
                        console.error('[AuthInterceptor] Reintento fallido. Haciendo logout.');
                        authService.logout().subscribe({ complete: () => router.navigate(['/login']) });
                        return throwError(() => error);
                    }

                    if (!isRefreshing) {
                        console.log(`[AuthInterceptor] Error 401 detectado. Iniciando Refresh Silencioso...`);
                        isRefreshing = true;
                        refreshTokenSubject.next(null);

                        return authService.refreshToken().pipe(
                            switchMap(() => {
                                console.log('[AuthInterceptor] Refresh exitoso. Reintentando petición original...');
                                isRefreshing = false;
                                refreshTokenSubject.next(true);

                                const retryReq = authReq.clone({
                                    headers: req.headers.set('X-Interceptor-Retry', 'true')
                                });
                                return next(retryReq);
                            }),
                            catchError((refreshError) => {
                                console.error('[AuthInterceptor] Fallo crítico en el refresco:', refreshError);
                                isRefreshing = false;
                                refreshTokenSubject.next(false);

                                // Logout and redirect to login
                                authService.logout().subscribe({ complete: () => router.navigate(['/login']) });
                                return throwError(() => refreshError);
                            }),
                            finalize(() => isRefreshing = false)
                        );

                    } else {
                        // If already refreshing, wait for it
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
