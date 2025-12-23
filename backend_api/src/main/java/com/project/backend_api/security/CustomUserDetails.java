package com.project.backend_api.security;

import com.project.backend_api.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class CustomUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final User user; // Keep reference if needed

    public CustomUserDetails(User user) {
        this(user, java.util.Collections.emptyList());
    }

    public CustomUserDetails(User user, java.util.List<com.project.backend_api.model.UserCompanyRole> userRoles) {
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.user = user;

        java.util.Set<SimpleGrantedAuthority> auths = new java.util.HashSet<>();

        // 1. Core Role based on Super Admin status
        if (Boolean.TRUE.equals(user.getIsSuperAdmin())) {
            auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            auths.add(new SimpleGrantedAuthority("ROLE_ROOT"));
        }

        // 2. Map all company roles to Authorities
        if (userRoles != null) {
            for (com.project.backend_api.model.UserCompanyRole ucr : userRoles) {
                // Check the explicit boolean flag from the Role entity
                if (ucr.getRole() != null && Boolean.TRUE.equals(ucr.getRole().getIsAdminRole())) {
                    auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                } else if (ucr.getRoleName() != null) {
                    // Fallback or other roles (prefixed with ROLE_ for hasRole checks)
                    auths.add(new SimpleGrantedAuthority("ROLE_" + ucr.getRoleName().toUpperCase()));
                }

                // Add all specific permissions of that role as authorities
                if (ucr.getRole() != null && ucr.getRole().getPermissions() != null) {
                    ucr.getRole().getPermissions().forEach(p -> {
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
        return true;
    }
}
