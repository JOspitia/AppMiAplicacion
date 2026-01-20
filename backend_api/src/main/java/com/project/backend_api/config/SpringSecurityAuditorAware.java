package com.project.backend_api.config;

import com.project.backend_api.model.core.management.User;
import com.project.backend_api.repository.core.management.UserRepository;
import com.project.backend_api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Implementación de AuditorAware para obtener el usuario autenticado actual
 * desde el contexto de seguridad de Spring.
 */
@Component
@RequiredArgsConstructor
public class SpringSecurityAuditorAware implements AuditorAware<User> {

    private final UserRepository userRepository;

    @Override
    public Optional<User> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            java.util.UUID userId = ((CustomUserDetails) authentication.getPrincipal()).getUser().getId();
            return userRepository.findById(userId);
        }

        return Optional.empty();
    }
}
