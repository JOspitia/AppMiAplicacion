package com.project.backend_api.security;

import com.project.backend_api.model.User;
import com.project.backend_api.repository.UserRepository;
import com.project.backend_api.repository.UserCompanyRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCompanyRoleRepository userCompanyRoleRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + usernameOrEmail));

        // Load roles to pass to CustomUserDetails
        java.util.List<com.project.backend_api.model.UserCompanyRole> roles = userCompanyRoleRepository
                .findByUserIdAndIsActiveTrue(user.getId());

        return new CustomUserDetails(user, roles);
    }
}
