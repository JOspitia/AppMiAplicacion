package com.project.backend_api.service;

import com.project.backend_api.model.Permission;
import com.project.backend_api.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    // ---------- CRUD ----------
    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    public Optional<Permission> getPermissionById(UUID id) {
        return permissionRepository.findById(id);
    }

    /**
     * Return all permissions (used by admin/root views).
     */
    public List<Permission> listAllPermissions() {
        return (List<Permission>) permissionRepository.findAll();
    }

    /**
     * Return only permissions that belong to modules with ACTIVE subscription for
     * the given company.
     */
    public List<Permission> getActivePermissions(UUID companyId) {
        return permissionRepository.findByActiveSubscriptions(companyId);
    }

    /**
     * Update a permission (admin UI).
     */
    public Permission updatePermission(UUID id, Permission updated) {
        return permissionRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setCategory(updated.getCategory());
                    return permissionRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Permission not found: " + id));
    }

    public void deletePermission(UUID id) {
        permissionRepository.deleteById(id);
    }

    // ---------- Helper for current user ----------
    public Set<String> getPermissionsForCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Collections.emptySet();
        }
        return authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());
    }
}
