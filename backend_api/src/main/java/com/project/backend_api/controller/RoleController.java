package com.project.backend_api.controller;

import com.project.backend_api.dto.RoleDto;
import com.project.backend_api.model.Role;
import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.RoleService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/management/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * Listar todos los roles de la empresa actual.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW') or hasAuthority('ROLE_ROOT')")
    public ResponseEntity<List<RoleDto>> listRoles(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // Obtenemos el ID de la empresa del Token, no de la URL ni de un contexto
        // estático
        UUID companyId = userDetails.getCompanyId();

        List<RoleDto> roles = roleService.listAllUserRoles(companyId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(roles);
    }

    /**
     * Obtener un rol específico para edición.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW') or hasAuthority('ROLE_ROOT')")
    public ResponseEntity<RoleDto> getRole(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Role role = roleService.getRoleById(id, userDetails.getCompanyId());
        return ResponseEntity.ok(convertToDto(role));
    }

    /**
     * Crear un nuevo rol.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('CORE_ROLE_CREATE') or hasAuthority('ROLE_ROOT')")
    public ResponseEntity<RoleDto> createRole(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody RoleRequest request) { // Usamos un DTO simple para recibir datos

        Role createdRole = roleService.createRole(
                request.getName(),
                request.getDescription(),
                request.getPermissionIds(),
                userDetails.getCompanyId());

        return ResponseEntity.ok(convertToDto(createdRole));
    }

    /**
     * Actualizar un rol existente.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CORE_ROLE_EDIT') or hasAuthority('ROLE_ROOT')")
    public ResponseEntity<RoleDto> updateRole(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody RoleRequest request) {

        Role updatedRole = roleService.updateRole(
                id,
                request.getName(),
                request.getDescription(),
                request.getPermissionIds(),
                userDetails.getCompanyId());

        return ResponseEntity.ok(convertToDto(updatedRole));
    }

    /**
     * Helper para convertir Entidad -> DTO
     */
    private RoleDto convertToDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .active(role.getActive())
                .isSystemRole(role.getIsSystemRole())
                .createdAt(role.getCreatedAt())
                // Opcional: Si necesitas devolver los IDs de permisos al front para marcar los
                // checkboxes
                // .permissionIds(role.getPermissions().stream().map(Permission::getId).collect(Collectors.toSet()))
                .build();
    }

    /**
     * DTO Interno para recibir peticiones (Request Body).
     * Puedes moverlo a un archivo separado si prefieres (ej:
     * RoleCreateRequest.java)
     */
    @Data
    public static class RoleRequest {
        private String name;
        private String description;
        private Set<UUID> permissionIds;
    }
}