package com.project.backend_api.service;

import com.project.backend_api.model.Company;
import com.project.backend_api.model.Permission;
import com.project.backend_api.model.Role;
import com.project.backend_api.repository.CompanyRepository;
import com.project.backend_api.repository.PermissionRepository;
import com.project.backend_api.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<Role> listAllUserRoles(UUID companyId) {
        return roleRepository.findByCompanyIdOrSystem(companyId);
    }

    @Transactional(readOnly = true)
    public Role getRoleById(UUID roleId, UUID companyId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        // Seguridad: Verificar que el rol pertenezca a la empresa o sea del sistema
        if (role.getCompany() != null && !role.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("Acceso denegado a este rol");
        }
        return role;
    }

    public Role createRole(String name, String description, Set<UUID> permissionIds, UUID companyId) {
        // 1. Validar Empresa
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        // 2. Validar Nombre Único
        if (roleRepository.existsByNameAndCompanyId(name, companyId)) {
            throw new IllegalArgumentException("Ya existe un rol con ese nombre en tu empresa");
        }

        // 3. Construir Rol
        Role role = Role.builder()
                .name(name)
                .description(description)
                .company(company)
                .active(true)
                .isSystemRole(false)
                .build();

        // 4. Asignar Permisos
        assignPermissions(role, permissionIds);

        return roleRepository.save(role);
    }

    public Role updateRole(UUID roleId, String name, String description, Set<UUID> permissionIds, UUID companyId) {
        Role role = getRoleById(roleId, companyId);

        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new IllegalArgumentException("No se pueden editar roles del sistema");
        }

        role.setName(name);
        role.setDescription(description);

        if (permissionIds != null) {
            assignPermissions(role, permissionIds);
        }

        return roleRepository.save(role);
    }

    private void assignPermissions(Role role, Set<UUID> permissionIds) {
        if (permissionIds != null && !permissionIds.isEmpty()) {
            Set<Permission> permissions = new HashSet<>();
            // Usamos findAllById de JpaRepository
            permissionRepository.findAllById(permissionIds).forEach(permissions::add);

            validatePermissionDependencies(permissions);
            role.setPermissions(permissions);
        } else {
            role.setPermissions(new HashSet<>());
        }
    }

    private void validatePermissionDependencies(Set<Permission> permissions) {
        Set<String> permissionNames = permissions.stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());

        for (String name : permissionNames) {
            if (name.endsWith("_CREATE") || name.endsWith("_EDIT") || name.endsWith("_DELETE")) {
                String baseModule = name.substring(0, name.lastIndexOf("_"));
                String viewPermission = baseModule + "_VIEW";

                if (!permissionNames.contains(viewPermission)) {
                    throw new IllegalArgumentException(
                            "Error de Integridad: El permiso '" + name +
                                    "' requiere el permiso de visualización ('" + viewPermission + "').");
                }
            }
        }
    }
}