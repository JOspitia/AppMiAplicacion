package com.project.backend_api.controller.core.management;

import com.project.backend_api.model.core.management.User;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/management/users/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;
    private final com.project.backend_api.repository.core.management.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/update")
    public ResponseEntity<User> updateProfile(@RequestBody User profileData) {
        User currentUser = authService.getCurrentUser();

        // Map fields from profileData to currentUser
        currentUser.setFirstName(profileData.getFirstName());
        currentUser.setFirstSurname(profileData.getFirstSurname());
        currentUser.setSecondSurname(profileData.getSecondSurname());
        currentUser.setPhoneNumber(profileData.getPhoneNumber());
        currentUser.setPhoneExtension(profileData.getPhoneExtension());
        currentUser.setAddress(profileData.getAddress());
        currentUser.setCountry(profileData.getCountry());
        currentUser.setDepartment(profileData.getDepartment());
        currentUser.setCity(profileData.getCity());
        currentUser.setGender(profileData.getGender());
        currentUser.setDateOfBirth(profileData.getDateOfBirth());
        currentUser.setAge(profileData.getAge());

        return ResponseEntity.ok(userRepository.save(currentUser));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Boolean> verifyPassword(@RequestBody java.util.Map<String, String> body) {
        String password = body.get("password");
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(passwordEncoder.matches(password, currentUser.getPassword()));
    }

    @PostMapping("/change-email")
    public ResponseEntity<Void> changeEmail(@RequestBody java.util.Map<String, String> body) {
        String newEmail = body.get("newEmail");
        User currentUser = authService.getCurrentUser();
        // logic for email change (e.g. sending verification)
        currentUser.setPendingEmail(newEmail);
        userRepository.save(currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody java.util.Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        User currentUser = authService.getCurrentUser();
        if (passwordEncoder.matches(oldPassword, currentUser.getPassword())) {
            currentUser.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(currentUser);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(400).build();
    }
}
