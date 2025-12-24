package com.project.backend_api.controller;

import com.project.backend_api.dto.CompanyDto;
import com.project.backend_api.dto.LoginRequest;
import com.project.backend_api.dto.LoginResponse;
import com.project.backend_api.dto.RegisterRequest;
import com.project.backend_api.model.Company;
import com.project.backend_api.model.LoginLog;
import com.project.backend_api.model.User;
import com.project.backend_api.repository.CompanyRepository;
import com.project.backend_api.repository.LoginLogRepository;
import com.project.backend_api.repository.UserCompanyRoleRepository;
import com.project.backend_api.service.UserService;
import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.model.RefreshToken;
import com.project.backend_api.security.RefreshTokenService;
import com.project.backend_api.security.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

        private final AuthenticationManager authenticationManager;
        private final JwtUtils jwtUtils;
        private final LoginLogRepository loginLogRepository;
        private final UserService userService;
        private final RefreshTokenService refreshTokenService;
        private final CompanyRepository companyRepository;
        private final UserCompanyRoleRepository userCompanyRoleRepository;
        private final com.project.backend_api.repository.UserRepository userRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        @Value("${app.security.cookie-secure:false}")
        private boolean cookieSecure;

        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
                try {
                        User user = userService.registerUser(registerRequest);
                        return ResponseEntity.ok(LoginResponse.builder()
                                        .message("Usuario registrado exitosamente: " + user.getUsername())
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                try {
                        // 1. Authenticate: support client-side hash migration.
                        Authentication authentication = null;

                        String clientHash = loginRequest.clientHash();
                        String presentedPassword = loginRequest.password();

                        // If client sent a clientHash (sha256), try authenticating using it first
                        if (clientHash != null && !clientHash.isBlank()) {
                                try {
                                        authentication = authenticationManager.authenticate(
                                                        new UsernamePasswordAuthenticationToken(
                                                                        loginRequest.usernameOrEmail(),
                                                                        clientHash));
                                } catch (org.springframework.security.core.AuthenticationException ex) {
                                        authentication = null;
                                }
                        }

                        // If not authenticated yet, try with presented (raw) password
                        if (authentication == null) {
                                authentication = authenticationManager.authenticate(
                                                new UsernamePasswordAuthenticationToken(
                                                                loginRequest.usernameOrEmail(),
                                                                presentedPassword));

                                // If login with raw succeeded and clientHash present, migrate stored password
                                if (clientHash != null && !clientHash.isBlank()) {
                                        try {
                                                // Load user and update password to bcrypt(clientHash)
                                                java.util.Optional<com.project.backend_api.model.User> optUser = userRepository
                                                                .findByUsernameOrEmail(
                                                                                loginRequest.usernameOrEmail(),
                                                                                loginRequest.usernameOrEmail());
                                                if (optUser.isPresent()) {
                                                        com.project.backend_api.model.User u = optUser.get();
                                                        u.setPassword(passwordEncoder.encode(clientHash));
                                                        userRepository.save(u);
                                                }
                                        } catch (Exception e) {
                                                // Migration failure shouldn't block login; log it
                                                System.err.println("Password migration failed: " + e.getMessage());
                                        }
                                }
                        }

                        // 2. Generate JWT
                        String jwt = jwtUtils.generateToken(authentication);

                        // 3. Get user and load companies
                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        User user = userDetails.getUser();

                        // Load companies based on role
                        java.util.List<Company> companies;
                        if (user.getIsSuperAdmin()) {
                                // Super admins see all companies
                                companies = companyRepository.findAllActiveCompanies();
                        } else {
                                // Regular users see only their assigned companies
                                companies = userCompanyRoleRepository.findCompaniesByUserId(user.getId());
                        }

                        // Convert to DTOs
                        java.util.List<CompanyDto> companyDtos = companies.stream()
                                        .map(c -> CompanyDto.builder()
                                                        .id(c.getId())
                                                        .name(c.getName())
                                                        .nit(c.getNit())
                                                        .build())
                                        .toList();

                        // 4. Log the login
                        java.util.Date expDate = jwtUtils.computeExpirationDateFromNow();
                        LoginLog log = LoginLog.builder()
                                        .user(user)
                                        .token(jwt.substring(0, Math.min(jwt.length(), 20)) + "...")
                                        .loginTime(LocalDateTime.now())
                                        .expirationTime(LocalDateTime.ofInstant(expDate.toInstant(),
                                                        java.time.ZoneId.systemDefault()))
                                        .ipAddress(getClientIp(request))
                                        .userAgent(request.getHeader("User-Agent"))
                                        .status("SUCCESS")
                                        .active(true)
                                        .build();
                        loginLogRepository.save(log);

                        // 5. Create Refresh Token (Long-lived 7 days)
                        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

                        // 6. Create HttpOnly Cookies
                        // Access Token Cookie - SameSite=None para compatibilidad con Cloudflare y
                        // Path=/ para SPA
                        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", jwt)
                                        .httpOnly(true)
                                        .secure(cookieSecure) // DEBE ser true en producción con SameSite=None
                                        .path("/") // Path raíz para evitar colisiones
                                        .maxAge(15 * 60) // 15 mins
                                        .sameSite(cookieSecure ? "None" : "Lax") // None en prod, Lax en dev
                                        .build();

                        // Refresh Token Cookie - mantener path específico
                        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                                        .httpOnly(true)
                                        .secure(cookieSecure)
                                        .path("/api/auth/refreshtoken") // Solo se envía a este endpoint
                                        .maxAge(7 * 24 * 60 * 60) // 7 days
                                        .sameSite(cookieSecure ? "None" : "Lax")
                                        .build();

                        org.springframework.http.HttpHeaders respHeaders = new org.springframework.http.HttpHeaders();
                        respHeaders.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
                        respHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                        return ResponseEntity.ok()
                                        .headers(respHeaders)
                                        .body(LoginResponse.builder()
                                                        .message("Login exitoso")
                                                        .role(authentication.getAuthorities().toString())
                                                        .companies(companyDtos)
                                                        .build());

                } catch (org.springframework.security.core.AuthenticationException e) {
                        return ResponseEntity.status(401).body("Credenciales incorrectas");
                }
        }

        @PostMapping("/refreshtoken")
        public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
                String csrfHeader = request.getHeader("X-XSRF-TOKEN");
                String cookieHeader = request.getHeader("Cookie");
                logger.info("Refresh token request to {}. X-XSRF-TOKEN='{}'. CookieHeader='{}'",
                                request.getRequestURI(), csrfHeader, cookieHeader);

                String refreshToken = jwtUtils.parseJwtFromCookie(request, "refreshToken"); // We need a method in
                                                                                            // JwtUtils or just get
                                                                                            // manually
                logger.debug("Parsed refresh token from cookie: {}", refreshToken);

                if (refreshToken != null && refreshToken.length() > 0) {
                        return refreshTokenService.findByToken(refreshToken)
                                        .map(refreshTokenService::verifyExpiration)
                                        .map(RefreshToken::getUser)
                                        .map(user -> {
                                                // Use CustomUserDetailsService logic: load roles to maintain
                                                // permissions
                                                java.util.List<com.project.backend_api.model.UserCompanyRole> roles = userCompanyRoleRepository
                                                                .findByUserIdAndIsActiveTrue(user.getId());
                                                CustomUserDetails userDetails = new CustomUserDetails(user, roles);

                                                // Manually create authentication token (we trust the refresh token)
                                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                                userDetails, null, userDetails.getAuthorities());

                                                String token = jwtUtils.generateToken(authentication);

                                                ResponseCookie jwtCookie = ResponseCookie.from("accessToken", token)
                                                                .httpOnly(true)
                                                                .secure(cookieSecure)
                                                                .path("/")
                                                                .maxAge(15 * 60) // 15 mins
                                                                .sameSite(cookieSecure ? "None" : "Lax")
                                                                .build();

                                                org.springframework.http.HttpHeaders respHeaders = new org.springframework.http.HttpHeaders();
                                                respHeaders.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
                                                logger.info("Refresh successful for user {} (issued new access cookie)",
                                                                user.getUsername());
                                                return ResponseEntity.ok()
                                                                .headers(respHeaders)
                                                                .body(java.util.Map.of("message",
                                                                                "Token refreshed successfully"));
                                        })
                                        .orElseThrow(() -> {
                                                logger.warn("Refresh token '{}' not found in database", refreshToken);
                                                return new RuntimeException("Refresh token is not in database!");
                                        });
                }

                logger.warn("Refresh token empty in request; cookies: {}", cookieHeader);
                return ResponseEntity.badRequest().body("Refresh Token is empty!");
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletRequest request,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                // Optional: Get user from request context to delete precise token
                // For audit purposes, log logout event BEFORE clearing cookies
                try {
                        com.project.backend_api.model.User logUser = null;
                        if (userDetails != null && userDetails.getUser() != null) {
                                java.util.Optional<com.project.backend_api.model.User> optUser = userRepository
                                                .findById(userDetails.getUser().getId());
                                if (optUser.isPresent()) {
                                        logUser = optUser.get();
                                }
                        }

                        // If we still don't have the user (e.g., SecurityContext cleared), try parsing
                        // the access token
                        if (logUser == null) {
                                try {
                                        String token = jwtUtils.parseJwtFromCookie(request, "accessToken");
                                        if (token != null && jwtUtils.validateJwtToken(token)) {
                                                String username = jwtUtils.getUserNameFromJwtToken(token);
                                                java.util.Optional<com.project.backend_api.model.User> optUser2 = userRepository
                                                                .findByUsernameOrEmail(username, username);
                                                if (optUser2.isPresent()) {
                                                        logUser = optUser2.get();
                                                }
                                        }
                                } catch (Exception ignored) {
                                        // Best-effort; don't block logout on token parse errors
                                }
                        }

                        LoginLog.LoginLogBuilder builder = LoginLog.builder()
                                        .ipAddress(getClientIp(request))
                                        .loginTime(LocalDateTime.now())
                                        .status("LOGOUT")
                                        .failureReason("Cierre de sesión voluntario")
                                        .userAgent(request.getHeader("User-Agent"))
                                        .active(false);

                        if (logUser != null) {
                                builder.user(logUser);
                        }

                        loginLogRepository.save(builder.build());
                } catch (Exception e) {
                        org.slf4j.LoggerFactory.getLogger(AuthController.class)
                                        .warn("No se pudo persistir el log de logout: {}", e.getMessage());
                }

                // Delete cookies - IMPORTANTE: usar mismo path y sameSite que al crearlas
                ResponseCookie jwtCookie = ResponseCookie.from("accessToken", "")
                                .httpOnly(true).secure(cookieSecure).path("/").maxAge(0)
                                .sameSite(cookieSecure ? "None" : "Lax").build();
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true).secure(cookieSecure).path("/api/auth/refreshtoken").maxAge(0)
                                .sameSite(cookieSecure ? "None" : "Lax").build();

                ResponseCookie companyCookie = ResponseCookie.from("companyContext", "")
                                .httpOnly(true).secure(cookieSecure).path("/").maxAge(0)
                                .sameSite(cookieSecure ? "None" : "Lax").build();

                org.springframework.http.HttpHeaders respHeaders = new org.springframework.http.HttpHeaders();
                respHeaders.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
                respHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                respHeaders.add(HttpHeaders.SET_COOKIE, companyCookie.toString());

                return ResponseEntity.ok()
                                .headers(respHeaders)
                                .body(java.util.Map.of("message", "Logout exitoso"));
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        HttpServletRequest request) { // Inyectar request para obtener CSRF
                if (userDetails == null) {
                        return ResponseEntity.status(401).body("No autenticado");
                }

                User user = userDetails.getUser();
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("firstSurname", user.getFirstSurname());
                response.put("isSuperAdmin", user.getIsSuperAdmin());

                // SOLUCIÓN: Enviar CSRF token explícitamente en JSON
                org.springframework.security.web.csrf.CsrfToken csrfToken = (org.springframework.security.web.csrf.CsrfToken) request
                                .getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
                if (csrfToken != null) {
                        response.put("csrfToken", csrfToken.getToken());
                        logger.debug("CSRF token incluido en /me response: {}", csrfToken.getToken());
                }

                return ResponseEntity.ok(response);
        }

        // Método auxiliar para obtener la IP real detrás de proxies o balanceadores
        private String getClientIp(HttpServletRequest request) {
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                        return request.getRemoteAddr();
                }
                return ip.split(",")[0].trim();
        }
}
