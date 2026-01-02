package com.project.backend_api.controller.core.management;

import com.project.backend_api.dto.core.management.RoleDto;
import com.project.backend_api.model.core.management.Role;
import com.project.backend_api.service.core.management.RoleService;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.project.backend_api.dto.core.administration.PermissionDto;
import com.project.backend_api.dto.core.management.RoleDetailDto;
import com.project.backend_api.dto.core.management.RoleRequestDto;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/core/management/roles")
@RequiredArgsConstructor
public class RoleManagementController {

    private final RoleService roleService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW')")
    public ResponseEntity<List<RoleDto>> listRoles() {
        UUID companyId = authService.getSelectedCompanyId();
        return ResponseEntity.ok(roleService.listAllUserRoles(companyId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CORE_ROLE_EDIT')")
    public ResponseEntity<RoleDto> saveRole(@RequestBody RoleRequestDto roleRequest) {
        UUID companyId = authService.getSelectedCompanyId();
        UUID currentUserId = authService.getCurrentUser().getId();

        Set<UUID> permissionIds = roleRequest.getPermissionIds();

        if (roleRequest.getId() == null) {
            return ResponseEntity
                    .ok(roleService.createRole(roleRequest.getName(), roleRequest.getDescription(), permissionIds,
                            companyId, currentUserId));
        } else {
            return ResponseEntity
                    .ok(roleService.updateRole(roleRequest.getId(), roleRequest.getName(), roleRequest.getDescription(),
                            permissionIds, companyId, currentUserId));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW')")
    public ResponseEntity<RoleDetailDto> getRole(@PathVariable UUID id) {
        UUID companyId = authService.getSelectedCompanyId();
        return ResponseEntity.ok(roleService.getRoleDetail(id, companyId));
    }

    @GetMapping("/permissions/grouped")
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW')")
    public ResponseEntity<Map<String, Map<String, List<PermissionDto>>>> getPermissionsGrouped() {
        UUID companyId = authService.getSelectedCompanyId();
        return ResponseEntity.ok(roleService.getGroupedPermissions(companyId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CORE_ROLE_EDIT')")
    public ResponseEntity<RoleDto> updateRole(@PathVariable UUID id, @RequestBody RoleRequestDto roleRequest) {
        roleRequest.setId(id);
        return saveRole(roleRequest);
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('CORE_ROLE_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        UUID companyId = authService.getSelectedCompanyId();
        roleService.toggleActive(id, companyId);
        return ResponseEntity.noContent().build();
    }
}
