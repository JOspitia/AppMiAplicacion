package com.project.backend_api.controller.core.management;

import com.project.backend_api.dto.core.management.AssignRolesRequest;
import com.project.backend_api.dto.core.management.CreateUserRequest;
import com.project.backend_api.dto.core.management.UserManagementDto;
import com.project.backend_api.service.core.management.UserService;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/core/management/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAuthority('CORE_USER_VIEW')")
    public ResponseEntity<List<UserManagementDto>> listUsers() {
        UUID companyId = authService.getSelectedCompanyId();
        var user = authService.getCurrentUser();
        boolean isPrivileged = Boolean.TRUE.equals(user.getIsSuperAdmin()) || Boolean.TRUE.equals(user.getIsRoot());
        return ResponseEntity.ok(userService.listUsersByCompany(companyId, isPrivileged));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CORE_USER_VIEW')")
    public ResponseEntity<UserManagementDto> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserManagementById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CORE_USER_EDIT')")
    public ResponseEntity<UserManagementDto> createUser(@RequestBody CreateUserRequest request) {
        UUID companyId = authService.getSelectedCompanyId();
        return ResponseEntity.ok(userService.createUser(request, companyId));
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('CORE_USER_EDIT')")
    public ResponseEntity<UserManagementDto> updateRoles(
            @PathVariable UUID userId,
            @RequestBody AssignRolesRequest request) {
        UUID companyId = authService.getSelectedCompanyId();
        return ResponseEntity.ok(userService.updateUserRoles(userId, companyId, request.roleIds()));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('CORE_USER_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        userService.toggleActive(id);
        return ResponseEntity.noContent().build();
    }
}
