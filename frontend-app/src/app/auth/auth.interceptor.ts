import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, catchError, filter, switchMap, take, finalize } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// --- ESTADO GLOBAL DEL INTERCEPTOR (Mutex) ---
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Clonar la petición para asegurar que enviamos credenciales (Cookies)
    const authReq = req.clone({ withCredentials: true });

    return next(authReq).pipe(
        catchError((error) => {
            // 2. Filtramos: Solo nos interesan los errores 401 (Unauthorized)
            if (error instanceof HttpErrorResponse && error.status === 401) {

                // A. Si el error viene del LOGIN o del mismo REFRESH, no intentamos nada.
                if (req.url.includes('/auth/login') || req.url.includes('/auth/refreshtoken')) {
                    return throwError(() => error);
                }

                // B. Manejo de Concurrencia (El semáforo)
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject.next(null); // Bloqueamos la señal

                    return authService.refreshToken().pipe(
                        switchMap(() => {
                            // ¡Éxito! Notificamos a los que están esperando
                            refreshTokenSubject.next(true);
                            return next(authReq);
                        }),
                        catchError((refreshErr) => {
                            // Si el refresh falla, forzamos Logout y redirigimos
                            isRefreshing = false;
                            authService.logout().subscribe({
                                complete: () => router.navigate(['/login'])
                            });
                            return throwError(() => refreshErr);
                        }),
                        finalize(() => {
                            isRefreshing = false; // Liberamos el semáforo
                        })
                    );

                } else {
                    // C. Si ya se está refrescando, ponemos esta petición en "Espera"
                    return refreshTokenSubject.pipe(
                        filter(result => result !== null),
                        take(1),
                        switchMap(() => next(authReq))
                    );
                }
            }

            return throwError(() => error);
        })
    );
};
