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

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtUtils jwtUtils;
        private final LoginLogRepository loginLogRepository;
        private final UserService userService;
        private final RefreshTokenService refreshTokenService;
        private final CompanyRepository companyRepository;
        private final UserCompanyRoleRepository userCompanyRoleRepository;

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
                        // 1. Authenticate
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        loginRequest.usernameOrEmail(),
                                                        loginRequest.password()));

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
                        LoginLog log = LoginLog.builder()
                                        .user(user)
                                        .token(jwt.substring(0, Math.min(jwt.length(), 20)) + "...")
                                        .loginTime(LocalDateTime.now())
                                        .ipAddress(request.getRemoteAddr())
                                        .userAgent(request.getHeader("User-Agent"))
                                        .active(true)
                                        .build();
                        loginLogRepository.save(log);

                        // 5. Create Refresh Token (Long-lived 7 days)
                        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

                        // 6. Create HttpOnly Cookies
                        // Access Token Cookie
                        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", jwt)
                                        .httpOnly(true)
                                        .secure(false) // True in Prod
                                        .path("/")
                                        .maxAge(15 * 60) // 15 mins
                                        // .maxAge(30) // 30 seconds
                                        .sameSite("Strict")
                                        .build();

                        // Refresh Token Cookie
                        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                                        .httpOnly(true)
                                        .secure(false) // True in Prod
                                        .path("/api/auth/refreshtoken") // Security hardening: only sent to refresh
                                                                        // endpoint
                                        .maxAge(7 * 24 * 60 * 60) // 7 days
                                        .sameSite("Strict")
                                        .build();

                        return ResponseEntity.ok()
                                        .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
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
                String refreshToken = jwtUtils.parseJwtFromCookie(request, "refreshToken"); // We need a method in
                                                                                            // JwtUtils or just get
                                                                                            // manually

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
                                                                .secure(false)
                                                                .path("/")
                                                                .maxAge(15 * 60) // 15 mins
                                                                .sameSite("Strict")
                                                                .build();

                                                return ResponseEntity.ok()
                                                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                                                .body(java.util.Map.of("message",
                                                                                "Token refreshed successfully"));
                                        })
                                        .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
                }
                return ResponseEntity.badRequest().body("Refresh Token is empty!");
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletRequest request) {
                // Optional: Get user from request context to delete precise token
                // For now, let's clear cookies. In a strict impl, we delete by user ID or token
                // value.

                // Delete cookies
                ResponseCookie jwtCookie = ResponseCookie.from("accessToken", "")
                                .httpOnly(true).secure(false).path("/").maxAge(0).sameSite("Strict").build();
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true).secure(false).path("/api/auth/refreshtoken").maxAge(0)
                                .sameSite("Strict").build();

                ResponseCookie companyCookie = ResponseCookie.from("companyContext", "")
                                .httpOnly(true).secure(false).path("/api").maxAge(0).sameSite("Strict").build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, companyCookie.toString())
                                .body("Logout exitoso");
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
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

                return ResponseEntity.ok(response);
        }
}
