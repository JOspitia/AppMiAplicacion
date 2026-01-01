package com.project.backend_api.security;



import com.project.backend_api.model.core.management.User;
import com.project.backend_api.repository.core.management.UserRepository;
import com.project.backend_api.repository.core.management.UserCompanyRoleRepository;
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
        return loadUserByUsernameAndCompany(usernameOrEmail, null);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CustomUserDetails loadUserByUsernameAndCompany(String usernameOrEmail, java.util.UUID companyId)
            throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + usernameOrEmail));

        // Load roles to pass to CustomUserDetails
        java.util.List<com.project.backend_api.model.core.management.UserCompanyRole> roles = userCompanyRoleRepository
                .findByUserIdAndIsActiveTrue(user.getId());

        return new CustomUserDetails(user, roles, companyId);
    }
}





