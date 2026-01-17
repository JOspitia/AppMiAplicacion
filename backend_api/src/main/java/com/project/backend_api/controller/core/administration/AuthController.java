package com.project.backend_api.controller.core.administration;

import com.project.backend_api.dto.core.administration.LoginRequest;
import com.project.backend_api.dto.core.administration.LoginResponse;
import com.project.backend_api.security.JwtUtils;
import com.project.backend_api.security.RefreshTokenService;
import com.project.backend_api.security.CustomUserDetails;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtUtils jwtUtils;
        private final RefreshTokenService refreshTokenService;
        private final com.project.backend_api.repository.core.management.UserCompanyRoleRepository userCompanyRoleRepository;
        private final com.project.backend_api.repository.core.management.UserRepository userRepository;
        private final com.project.backend_api.service.core.management.UserService userService;

        @PostMapping("/register")
        public ResponseEntity<?> register(
                        @Valid @RequestBody com.project.backend_api.dto.core.administration.RegisterRequest registerRequest) {
                userService.registerUser(registerRequest);
                return ResponseEntity.ok(Map.of("message", "¡Registro casi completo! Por favor revisa tu correo."));
        }

        @PostMapping("/verify")
        public ResponseEntity<?> verify(@RequestBody Map<String, String> request) {
                String token = request.get("token");
                if (token == null) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Token es requerido"));
                }
                userService.verifyEmail(token);
                return ResponseEntity.ok(Map.of("message", "Email verificado con éxito."));
        }

        @PostMapping("/resend-verification")
        public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
                String email = request.get("email");
                if (email == null) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Email es requerido"));
                }
                userService.resendVerificationEmail(email);
                return ResponseEntity.ok(Map.of("message", "Email de verificación reenviado."));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request,
                        HttpServletResponse response) {

                log.info("Intento de login para: {}", loginRequest.username());

                // 1. Manual validation BEFORE authentication using repository directly
                var userOpt = userRepository.findByUsernameOrEmail(loginRequest.username());

                if (userOpt.isPresent()) {
                        var user = userOpt.get();
                        log.info("Usuario detectado: {}. Verificado: {}", user.getUsername(), user.getVerified());

                        if (!Boolean.TRUE.equals(user.getVerified())) {
                                log.warn("Bloqueo por falta de verificación (403): {}", loginRequest.username());
                                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                                .body(Map.of(
                                                                "message",
                                                                "Cuenta no verificada. Por favor, revisa tu correo electrónico.",
                                                                "email", user.getEmail()));
                        }
                } else {
                        log.info("Usuario no existe en el sistema: {}", loginRequest.username());
                }

                // 2. Proceed with standard authentication
                Authentication authentication;
                try {
                        log.debug("Llamando a AuthenticationManager...");
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.username(),
                                                        loginRequest.password()));
                        log.info("Autenticación exitosa (200) para: {}", loginRequest.username());
                } catch (org.springframework.security.authentication.BadCredentialsException e) {
                        log.warn("Credenciales inválidas (401) para: {}", loginRequest.username());
                        return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("message", "Usuario o contraseña incorrectos."));
                } catch (org.springframework.security.core.AuthenticationException e) {
                        log.error("Error de seguridad (Spring): {} - {}", e.getClass().getSimpleName(), e.getMessage());
                        return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("message", "Error de autenticación: " + e.getMessage()));
                } catch (Exception e) {
                        log.error("ERROR CRÍTICO inesperado: ", e);
                        return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of("message", "Error interno en el servidor."));
                }

                SecurityContextHolder.getContext().setAuthentication(authentication);
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                // Hybrid Strategy: Cookie + Header/Body
                ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

                String jwt = jwtUtils.generateToken(authentication);
                String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser().getId()).getToken();
                ResponseCookie refreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken);

                // Fetch User Companies
                List<com.project.backend_api.dto.core.management.CompanySummaryDto> companies = userCompanyRoleRepository
                                .findByUserIdAndIsActiveTrue(userDetails.getUser().getId())
                                .stream()
                                .map(ucr -> ucr.getCompany())
                                .distinct()
                                .map(c -> com.project.backend_api.dto.core.management.CompanySummaryDto.builder()
                                                .id(c.getId())
                                                .name(c.getName())
                                                .nit(c.getNit())
                                                .logoUrl(c.getLogoUrl())
                                                .primaryColor(c.getPrimaryColor())
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(LoginResponse.builder()
                                                .token(jwt)
                                                .refreshToken(refreshToken)
                                                .username(userDetails.getUsername())
                                                .firstName(userDetails.getUser().getFirstName())
                                                .role(userDetails.getAuthorities().stream().findFirst()
                                                                .map(a -> a.getAuthority()).orElse("ROLE_USER"))
                                                .permissions(userDetails.getAuthorities().stream()
                                                                .map(a -> a.getAuthority())
                                                                .collect(Collectors.toList()))
                                                .companies(companies)
                                                .requirePasswordChange(userDetails.getUser().getRequirePasswordChange())
                                                .isSuperAdmin(userDetails.getUser().getIsSuperAdmin())
                                                .build());
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(Authentication authentication, HttpServletRequest request) {
                if (authentication == null)
                        return ResponseEntity.status(401).build();

                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                // Generate a fresh token for the frontend (Hybrid Strategy support)
                String freshToken = jwtUtils.generateToken(authentication);

                // Return safe DTO with token
                return ResponseEntity.ok(LoginResponse.builder()
                                .token(freshToken)
                                .username(userDetails.getUsername())
                                .firstName(userDetails.getUser().getFirstName())
                                .role(userDetails.getAuthorities().stream().findFirst()
                                                .map(a -> a.getAuthority()).orElse("ROLE_USER"))
                                .permissions(userDetails.getAuthorities().stream()
                                                .map(a -> a.getAuthority())
                                                .collect(Collectors.toList()))
                                .isSuperAdmin(userDetails.getUser().getIsSuperAdmin())
                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response) {
                ResponseCookie cleanJwtCookie = jwtUtils.getCleanJwtCookie();
                ResponseCookie cleanRefreshCookie = jwtUtils.getCleanRefreshJwtCookie();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cleanJwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, cleanRefreshCookie.toString())
                                .build();
        }
}
