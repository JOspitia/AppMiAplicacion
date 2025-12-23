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
        return passwordEncoder.matches(password, user.getPassword());
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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
