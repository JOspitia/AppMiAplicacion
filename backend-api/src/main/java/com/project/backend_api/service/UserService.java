package com.project.backend_api.service;

import com.project.backend_api.dto.RegisterRequest;
import com.project.backend_api.model.User;
import com.project.backend_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya está en uso.");
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está en uso.");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .firstName(request.firstName())
                .firstSurname(request.firstSurname())
                .password(passwordEncoder.encode(request.password()))
                .createdAt(LocalDateTime.now())
                .isSuperAdmin(false)
                .verified(false)
                .build();

        return userRepository.save(user);
    }
}
