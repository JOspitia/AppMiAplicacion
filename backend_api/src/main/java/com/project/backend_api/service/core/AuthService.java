package com.project.backend_api.service.core;

import com.project.backend_api.model.core.management.User;
import com.project.backend_api.repository.core.management.UserRepository;
import com.project.backend_api.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUser();
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    public UUID getSelectedCompanyId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            // Try header first
            String companyIdHeader = request.getHeader("X-Company-Id");
            if (companyIdHeader != null && !companyIdHeader.isEmpty()) {
                return UUID.fromString(companyIdHeader);
            }

            // Try cookie
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("companyContext".equals(cookie.getName()) && cookie.getValue() != null
                            && !cookie.getValue().isEmpty()) {
                        return UUID.fromString(cookie.getValue());
                    }
                }
            }
        }

        // Fallback or throw error if company selection is mandatory
        throw new RuntimeException("No se ha seleccionado una empresa");
    }
}
