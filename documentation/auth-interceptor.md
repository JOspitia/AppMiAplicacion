# Auth Interceptor (Unified CSRF + Refresh) — Implementation Guide

This document explains the unified Auth Interceptor we implemented to handle both token refresh and CSRF cookie recovery in a single place.

## Goals
- Handle `401 Unauthorized` by performing a refresh token request and retrying the original request.
- Handle `403 Forbidden` (most commonly caused by missing/expired CSRF cookie) by performing a lightweight `GET /api/profile/me` (prefetch) to force server to set `XSRF-TOKEN` cookie, then retry original request.
- Avoid circular dependency between the interceptor and services that use `HttpClient`.
- Avoid request retry loops using custom headers.

## Key Implementation Points
- Interceptor is implemented as a functional `HttpInterceptorFn` (`auth.interceptor.ts`) at the application level.
- Uses a global mutex (`BehaviorSubject`) to ensure only a single refresh is active at a time.
- Uses two retry guards:
  - `X-Interceptor-Retry` for requests reattempted after a refresh.
  - `X-CSRF-Retry` for requests reattempted after CSRF prefetch.

## Circular DI mitigation
- Do not inject `ProfileService` directly in the interceptor: `ProfileService` itself uses `HttpClient` which relies on the interceptor. To avoid a circular dependency we use `HttpClient` directly for the CSRF prefetch request:

```ts
const http = inject(HttpClient);
return http.get('/api/profile/me', { withCredentials: true }).pipe(...)
```

This prevents Angular DI cycles and keeps the interceptor self-contained.

## Registering the Interceptor
Add it to your `app.config.ts` providers (or module providers):

```ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// In providers: withInterceptors([authInterceptor]) and/or provide HTTP_INTERCEPTORS for class-based variants
```

We use a combination of `withInterceptors([authInterceptor])` (functional interceptor) and avoided adding a separate class-based CSRF interceptor.

## Debugging tips
- Client-side logs (console.debug / console.log) are placed at decision points (403 prefetch, 401 refresh start/success/failure). Monitor the console while reproducing errors.
- Server-side logs:
  - `/api/auth/refreshtoken` logs the `Cookie` header and `X-XSRF-TOKEN` header when called.
  - `SecurityExceptionHandler` logs details when an `AccessDeniedException` (403) is thrown: path/method/XSRF header/cookies.
- To reproduce a 403: clear `XSRF-TOKEN` cookie in DevTools, then attempt a state-changing request (POST / change-password). The interceptor should auto-prefetch and retry.

## Safety and loops
- The interceptor marks retried requests with headers so subsequent rejections are treated as real errors (and cause logout when refresh fails repeatedly).
- Avoid attempting CSRF prefetch for `GET /api/profile/me` itself to prevent loops.

## Summary
This unified approach simplifies component logic and centralizes security error recovery, making it easier to reason about and secure the application. It also improves observability by adding server logs that help distinguish a missing CSRF token from a failing refresh token.

---

Document last updated: 2025-12-23