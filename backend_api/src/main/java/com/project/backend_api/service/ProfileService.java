package com.project.backend_api.service;

import com.project.backend_api.dto.UserProfileDto;
import com.project.backend_api.model.User;
import com.project.backend_api.repository.UserRepository;
import com.project.backend_api.model.Gender;
import com.project.backend_api.repository.GenderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final GenderRepository genderRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .firstSurname(user.getFirstSurname())
                .secondSurname(user.getSecondSurname())
                .phoneNumber(user.getPhoneNumber())
                .phoneExtension(user.getPhoneExtension())
                .address(user.getAddress())
                .country(user.getCountry())
                .department(user.getDepartment())
                .city(user.getCity())
                .genderId(user.getGender() != null ? user.getGender().getId() : null)
                .genderName(user.getGender() != null ? user.getGender().getName() : null)
                .dateOfBirth(user.getDateOfBirth())
                .age(user.getAge())
                .pendingEmail(user.getPendingEmail())
                .isSuperAdmin(user.getIsSuperAdmin())
                .verified(user.getVerified())
                .build();
    }

    @Transactional
    public void updateProfile(UUID userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setPhoneNumber(dto.phoneNumber());
        user.setPhoneExtension(dto.phoneExtension());
        user.setAddress(dto.address());
        user.setCountry(dto.country());
        user.setDepartment(dto.department());
        user.setCity(dto.city());
        user.setDateOfBirth(dto.dateOfBirth());
        user.setAge(dto.age());

        if (dto.genderId() != null) {
            Gender gender = genderRepository.findById(dto.genderId())
                    .orElseThrow(() -> new RuntimeException("Género no encontrado"));
            user.setGender(gender);
        }

        userRepository.save(user);
    }

    public boolean verifyPassword(UUID userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        // Support both raw and client-side SHA-256 hashed stored passwords
        if (passwordEncoder.matches(password, user.getPassword())) return true;
        String sha = sha256Hex(password);
        return sha != null && passwordEncoder.matches(sha, user.getPassword());
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        // First, try matching the raw password (legacy / default case)
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            // If raw didn't match, try the client-side SHA-256 migration case: stored password
            // might be bcrypt(sha256(rawPassword)). In that case accept the SHA match and
            // migrate the stored password to use the SHA of the new password (so behavior is
            // consistent with the login migration).
            String shaOld = sha256Hex(oldPassword);
            if (shaOld == null || !passwordEncoder.matches(shaOld, user.getPassword())) {
                throw new RuntimeException("La contraseña actual es incorrecta");
            }

            // OK: old matched as bcrypt(sha256(oldPassword)), so encode bcrypt(sha256(newPassword))
            user.setPassword(passwordEncoder.encode(sha256Hex(newPassword)));
            userRepository.save(user);
            return;
        }

        // Normal flow: oldPassword matched as raw; store bcrypt(newPassword)
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // This should never happen in JVMs that provide SHA-256
            return null;
        }
    }

    @Transactional
    public void requestEmailChange(UUID userId, String newEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está en uso");
        }

        user.setPendingEmail(newEmail);
        user.setPendingEmailToken(UUID.randomUUID().toString());
        // In a real app, send verification email here
        userRepository.save(user);
    }
}
