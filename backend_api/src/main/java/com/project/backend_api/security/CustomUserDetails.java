package com.project.backend_api.security;

import com.project.backend_api.model.core.management.User;
import com.project.backend_api.model.core.management.Role;
import com.project.backend_api.model.core.management.UserCompanyRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final User user; // Keep reference if needed
    private final UUID companyId; // The company currently active for this session

    public CustomUserDetails(User user) {
        this(user, java.util.Collections.emptyList(), null);
    }

    public CustomUserDetails(User user, java.util.List<UserCompanyRole> userRoles,
            UUID companyId) {
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.user = user;
        this.companyId = companyId;

        java.util.Set<SimpleGrantedAuthority> auths = new java.util.HashSet<>();

        // 1. Core Role based on Super Admin / Root / Admin status
        if (Boolean.TRUE.equals(user.getIsSuperAdmin()) || Boolean.TRUE.equals(user.getIsRoot())) {
            auths.add(new SimpleGrantedAuthority("ROLE_ROOT"));
            auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else if (Boolean.TRUE.equals(user.getIsAdmin())) {
            auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        // 2. Map all company roles to Authorities
        if (userRoles != null) {
            for (UserCompanyRole ucr : userRoles) {
                Role role = ucr.getRole();
                // If the role is explicitly deactivated, skip it
                if (role != null && !Boolean.TRUE.equals(role.getActive())) {
                    continue;
                }

                // Check markers on the Role
                if (role != null) {
                    if (Boolean.TRUE.equals(role.getIsRootRole())) {
                        auths.add(new SimpleGrantedAuthority("ROLE_ROOT"));
                        auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    } else if (Boolean.TRUE.equals(role.getIsAdminRole())) {
                        auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }
                }

                if (ucr.getRoleName() != null) {
                    // Fallback or other roles (prefixed with ROLE_ for hasRole checks)
                    auths.add(new SimpleGrantedAuthority("ROLE_" + ucr.getRoleName().toUpperCase()));
                }

                // Add all specific permissions of that role as authorities
                if (role != null && role.getPermissions() != null) {
                    role.getPermissions().forEach(p -> {
                        auths.add(new SimpleGrantedAuthority(p.getName()));
                    });
                }
            }
        }

        this.authorities = java.util.Collections.unmodifiableList(new java.util.ArrayList<>(auths));
    }

    public User getUser() {
        return user;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getVerified());
    }

}
