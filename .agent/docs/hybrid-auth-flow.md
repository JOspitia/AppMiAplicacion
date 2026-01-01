# Estrategia de Autenticación Híbrida - Flujo Actualizado

## Resumen
El sistema usa una **estrategia híbrida** que combina cookies HttpOnly (seguras) con tokens en localStorage (para SPAs).

## Flujo de Login

### 1. Usuario hace login
```typescript
// LoginComponent.onSubmit()
authService.login(credentials).subscribe({
  next: (response) => {
    // response contiene: { token, companies, permissions, ... }
  }
})
```

### 2. Backend responde
```java
// AuthController.login()
return ResponseEntity.ok()
  .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())  // Cookie HttpOnly
  .body(LoginResponse.builder()
    .token(jwt)  // Token en el body para localStorage
    .build());
```

### 3. Frontend guarda el token (SINCRONAMENTE)
```typescript
// AuthService.login() - usa map() no tap()
login(credentials): Observable<User> {
  return this.http.post<User>('/api/auth/login', credentials).pipe(
    map(user => {
      this.currentUser.set(user);  // ✅ SINCRÓNICO
      localStorage.setItem('auth_token', user.token);  // ✅ SINCRÓNICO
      return user;  // ✅ Retorna para que el componente pueda navegar
    })
  );
}
```

### 4. Usuario navega a ruta protegida
```typescript
// authGuard verifica PRIMERO el signal (sin HTTP request)
export const authGuard: CanActivateFn = (route, state) => {
  const currentUser = authService.currentUser();
  if (currentUser) {
    return true;  // ✅ Acceso inmediato, sin HTTP request
  }
  
  // Solo si NO hay usuario en memoria, verificar con backend
  return authService.me().pipe(...);
};
```

### 5. Interceptor agrega el token a TODAS las peticiones
```typescript
// auth.interceptor.ts
const token = localStorage.getItem('auth_token');
let authReq = req.clone({ 
  withCredentials: true,  // Envía cookies
  setHeaders: token ? { 'Authorization': `Bearer ${token}` } : {}  // Envía header
});
```

### 6. Backend verifica el token (PRIORIDAD: Header > Cookie)
```java
// JwtTokenFilter.parseJwt()
// 1. Intenta leer del header Authorization (MÁS CONFIABLE)
String headerAuth = request.getHeader("Authorization");
if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
  return headerAuth.substring(7);
}

// 2. Fallback: Lee de la cookie jwt (para compatibilidad)
if (request.getCookies() != null) {
  for (Cookie cookie : request.getCookies()) {
    if ("jwt".equals(cookie.getName())) {
      return cookie.getValue();
    }
  }
}
```

## Ventajas de esta estrategia

1. **Seguridad**: Cookie HttpOnly protege contra XSS
2. **Compatibilidad SPA**: Token en localStorage permite navegación sin recargas
3. **Sin peticiones duplicadas**: Guard verifica signal antes de hacer HTTP request
4. **Sincronía garantizada**: `map()` en lugar de `tap()` asegura que el token se guarde antes de navegar
5. **Prioridad correcta**: Backend prefiere header sobre cookie (más confiable para SPAs)

## Solución al problema "dos peticiones"

**Antes**: 
- `tap()` era asíncrono → token se guardaba DESPUÉS de navegar → guard fallaba → petición duplicada

**Ahora**:
- `map()` es síncrono → token se guarda ANTES de retornar → guard encuentra el usuario → UNA sola petición

## Debugging

Si sigues viendo peticiones duplicadas:

1. Verifica que `currentUser` se establezca en el login:
```typescript
console.log('currentUser after login:', authService.currentUser());
```

2. Verifica que el guard encuentre el usuario:
```typescript
// En auth.guard.ts
const currentUser = authService.currentUser();
console.log('Guard - currentUser:', currentUser);
```

3. Verifica que el token esté en localStorage:
```typescript
console.log('Token in localStorage:', localStorage.getItem('auth_token'));
```
