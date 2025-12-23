package com.project.backend_api.controller;

import com.project.backend_api.dto.UserProfileDto;
import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(profileService.getUserProfile(userDetails.getUser().getId()));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserProfileDto profileDto) {
        profileService.updateProfile(userDetails.getUser().getId(), profileDto);
        return ResponseEntity.ok(Map.of("message", "Perfil actualizado exitosamente"));
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
        profileService.changePassword(
                userDetails.getUser().getId(),
                request.get("oldPassword"),
                request.get("newPassword"),
                request.get("confirmPassword"));
        return ResponseEntity.ok(Map.of("message", "Contraseña cambiada exitosamente"));
    }

    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        profileService.requestEmailChange(userDetails.getUser().getId(), request.get("newEmail"));
        return ResponseEntity.ok(Map.of("message", "Solicitud de cambio de correo enviada"));
    }
}
