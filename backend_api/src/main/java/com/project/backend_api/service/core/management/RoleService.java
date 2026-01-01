package com.project.backend_api.service.core.management;

import com.project.backend_api.dto.core.management.RoleDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.administration.Permission;
import com.project.backend_api.model.core.management.Role;
import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.repository.core.administration.PermissionRepository;
import com.project.backend_api.repository.core.management.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.backend_api.dto.core.administration.PermissionDto;
import com.project.backend_api.dto.core.management.RoleDetailDto;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<RoleDto> listAllUserRoles(UUID companyId) {
        return roleRepository.findByCompanyIdOrSystem(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RoleDto convertToDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystemRole(role.getIsSystemRole())
                .active(role.getActive())
                .createdAt(role.getCreatedAt())
                .permissionCount(role.getPermissions() != null ? role.getPermissions().size() : 0)
                .build();
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

    public RoleDto createRole(String name, String description, Set<UUID> permissionIds, UUID companyId,
            UUID currentUserId) {
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
                .createdBy(currentUserId)
                .createdAt(java.time.LocalDateTime.now())
                .updatedBy(currentUserId)
                .updatedAt(java.time.LocalDateTime.now())
                .build();

        // 4. Asignar Permisos
        assignPermissions(role, permissionIds);

        return convertToDto(roleRepository.save(role));
    }

    public RoleDto updateRole(UUID roleId, String name, String description, Set<UUID> permissionIds, UUID companyId,
            UUID currentUserId) {
        Role role = getRoleById(roleId, companyId);

        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new IllegalArgumentException("No se pueden editar roles del sistema");
        }

        role.setName(name);
        role.setDescription(description);
        role.setUpdatedBy(currentUserId);
        role.setUpdatedAt(java.time.LocalDateTime.now());

        if (permissionIds != null) {
            assignPermissions(role, permissionIds);
        }

        return convertToDto(roleRepository.save(role));
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

    @Transactional(readOnly = true)
    public RoleDetailDto getRoleDetail(UUID roleId, UUID companyId) {
        Role role = getRoleById(roleId, companyId);
        return RoleDetailDto.builder()
                .role(convertToDto(role))
                .assignedPermissionIds(role.getPermissions().stream()
                        .map(Permission::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Map<String, List<PermissionDto>>> getGroupedPermissions(UUID companyId) {
        List<Permission> allPermissions = permissionRepository.findAll();

        return allPermissions.stream()
                .map(this::convertToPermissionDto)
                .collect(Collectors.groupingBy(
                        p -> p.getModuleName() != null ? p.getModuleName() : "Otros",
                        Collectors.groupingBy(
                                p -> p.getCategory() != null ? p.getCategory() : "General")));
    }

    private PermissionDto convertToPermissionDto(Permission p) {
        String moduleName = "Otros";
        String categoryName = "General";
        String categoryIcon = "shield";
        String categoryDesc = "";

        if (p.getCategory() != null) {
            categoryName = p.getCategory().getName();
            categoryIcon = p.getCategory().getIcon();
            categoryDesc = p.getCategory().getDescription();
            if (p.getCategory().getModule() != null) {
                moduleName = p.getCategory().getModule().getName();
            }
        }

        String actionType = "ACTION";
        if (p.getName().endsWith("_VIEW"))
            actionType = "VIEW";
        else if (p.getName().endsWith("_CREATE"))
            actionType = "CREATE";
        else if (p.getName().endsWith("_EDIT"))
            actionType = "EDIT";
        else if (p.getName().endsWith("_DELETE"))
            actionType = "DELETE";

        return PermissionDto.builder()
                .id(p.getId())
                .name(p.getName())
                .displayName(p.getDisplayName())
                .description(p.getDescription())
                .moduleName(moduleName)
                .category(categoryName)
                .categoryIcon(categoryIcon)
                .categoryDescription(categoryDesc)
                .actionType(actionType)
                .isSystem(p.getIsSystem())
                .build();
    }

    public void toggleActive(UUID roleId, UUID companyId) {
        Role role = getRoleById(roleId, companyId);
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new IllegalArgumentException("No se pueden desactivar roles del sistema");
        }
        role.setActive(!Boolean.TRUE.equals(role.getActive()));
        roleRepository.save(role);
    }
}
