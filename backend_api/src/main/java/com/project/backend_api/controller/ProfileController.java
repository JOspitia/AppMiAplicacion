package com.project.backend_api.controller;

import com.project.backend_api.dto.UserProfileDto;
import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.project.backend_api.security.JwtUtils;
import com.project.backend_api.security.RefreshTokenService;
import com.project.backend_api.model.RefreshToken;
import com.project.backend_api.model.User;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    // Services
    private final ProfileService profileService;

    // JWT Utils
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getUserProfile(userDetails.getUser().getId()));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserProfileDto profileDto) {

        // Update profile
        profileService.updateProfile(userDetails.getUser().getId(), profileDto);

        // Generate new JWT
        User user = userDetails.getUser();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user);

        // Return response
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(Map.of("message", "Perfil actualizado exitosamente"));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Boolean> verifyPassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        String password = request.get("password");
        return ResponseEntity.ok(profileService.verifyPassword(userDetails.getUser().getId(), password));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {

        // Change password
        profileService.changePassword(
                userDetails.getUser().getId(),
                request.get("oldPassword"),
                request.get("newPassword"),
                request.get("confirmPassword"));

        // Generate new JWT
        User user = userDetails.getUser();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        ResponseCookie jwtRefreshCookie = jwtUtils.generateRefreshJwtCookie(refreshToken.getToken());

        // Return response
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(Map.of("message", "Contraseña cambiada exitosamente"));
    }

    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        profileService.requestEmailChange(userDetails.getUser().getId(), request.get("newEmail"));
        return ResponseEntity.ok(Map.of("message", "Solicitud de cambio de correo enviada"));
    }
}
