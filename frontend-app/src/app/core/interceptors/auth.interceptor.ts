import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// --- ESTADO GLOBAL DEL INTERCEPTOR (MUTEX) ---
// Estas variables viven fuera de la función para mantener el estado entre llamadas
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Asegurar que siempre enviamos credenciales (Cookies)
    // Esto es vital para que viajen el JWT y el XSRF-TOKEN
    const authReq = req.clone({ withCredentials: true });

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {

                // Evitar bucles infinitos: Si la petición ya fue reintentada por el interceptor, no refrescamos más
                if (req.headers.has('X-Interceptor-Retry')) {
                    console.error('[AuthInterceptor] El reintento falló de nuevo. Cancelando flujo para evitar bucle.', error.url);
                    return throwError(() => error);
                }

                if (req.url.includes('/auth/login') || req.url.includes('/auth/refreshtoken')) {
                    return throwError(() => error);
                }

                if (!isRefreshing) {
                    console.log(`[AuthInterceptor] Error ${error.status} detectado. Iniciando Refresh Silencioso...`);
                    isRefreshing = true;
                    refreshTokenSubject.next(null);

                    return authService.refreshToken().pipe(
                        switchMap(() => {
                            console.log('[AuthInterceptor] Refresh exitoso. Reintentando petición original...');
                            isRefreshing = false;
                            refreshTokenSubject.next(true);

                            // Marcamos la petición como reintentada
                            const retryReq = req.clone({
                                withCredentials: true,
                                headers: req.headers.set('X-Interceptor-Retry', 'true')
                            });
                            return next(retryReq);
                        }),
                        catchError((refreshError) => {
                            console.error('[AuthInterceptor] Fallo crítico en el refresco:', refreshError);
                            isRefreshing = false;
                            refreshTokenSubject.next(false);

                            if (error.status === 401) {
                                authService.logout().subscribe({
                                    complete: () => router.navigate(['/login'])
                                });
                            }
                            return throwError(() => refreshError);
                        }),
                        finalize(() => isRefreshing = false)
                    );

                } else {
                    console.log('[AuthInterceptor] Esperando a que termine el refresco en curso...');
                    return refreshTokenSubject.pipe(
                        filter(result => result !== null),
                        take(1),
                        switchMap(success => {
                            if (success) {
                                const retryReq = req.clone({
                                    withCredentials: true,
                                    headers: req.headers.set('X-Interceptor-Retry', 'true')
                                });
                                return next(retryReq);
                            }
                            return throwError(() => error);
                        })
                    );
                }
            }
            return throwError(() => error);
        })
    );
};
