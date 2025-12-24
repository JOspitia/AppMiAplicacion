# Change Password Form System

This document describes the `ChangePasswordComponent` behavior, validation, UX and security considerations for the Change Password flow (`/core/management/users/profile/change-password`).

## 1. Overview

The Change Password screen is a **standalone** Angular component that uses reactive forms (`FormGroup`) and PrimeNG `p-password` controls for both current and new passwords. The UI shows clear success/error messages via the shared `app-alert` component.

## 2. Form & Validation

- Form fields:
  - `oldPassword` (required)
  - `newPassword` (required, minLength 8)
  - `confirmPassword` (required, must match `newPassword`)
- Validator: custom `passwordsMatch` validator applied to the form group to enforce equality between `newPassword` and `confirmPassword`.
- UX feedback:
  - Inline password strength provided by `p-password` for `newPassword` with localized labels (Débil/Media/Fuerte).
  - If passwords don't match, a small inline alert is shown near the fields.

## 3. Security & Retry Behavior

- The component performs no CSRF or refresh retries itself. This logic was centralized in a unified **AuthInterceptor** which handles:
  - `401` → performs refresh token flow and reattempts original request.
  - `403` → performs a lightweight `GET /api/profile/me` to force `XSRF-TOKEN` cookie creation and retries the original request.

- Benefits:
  - Simpler component code and fewer chances for inconsistent retry logic.
  - Centralized loop protection and retry marking via headers (`X-Interceptor-Retry`, `X-CSRF-Retry`).

## 4. UX details

- Alerts are displayed by `app-alert` (success or error). On success, the user sees a confirmation message and is redirected to the profile overview after a short delay.
- The submit button shows a loading state while the request is in flight.

## 5. Testing Checklist

- Manual:
  - Submit valid change and expect 200 and success alert.
  - Submit invalid new passwords (short or mismatch) and expect client-side validation errors.
  - Force CSRF missing state (clear cookies) and ensure interceptor prefetch + retry results in a successful request or a meaningful error.

- Automated (suggested):
  - E2E: login → change password flow (including the case where the `XSRF-TOKEN` is absent).
  - Unit: form validators ensuring mismatch detection and length rules.

## 6. Implementation notes

- Files:
  - `frontend-app/src/app/core/management/users/profile/change-password.component.ts` (component implementation)
  - `frontend-app/src/app/core/services/profile.service.ts` (API abstraction)
- Error handling in the component assumes that errors surfaced are "real" application errors (400 validation, 403 that couldn't be resolved by interceptor, etc.).

---

Document last updated: 2025-12-23