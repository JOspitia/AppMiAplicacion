package com.project.backend_api.controller.core.administration;



import com.project.backend_api.model.core.administration.Permission;
import com.project.backend_api.model.core.administration.PermissionCategory;
import com.project.backend_api.service.core.administration.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/catalog")
    @PreAuthorize("hasAuthority('CORE_PERMISSION_VIEW')")
    public ResponseEntity<List<PermissionCategory>> getCatalog() {
        return ResponseEntity.ok(permissionService.findAllCategories());
    }

    @GetMapping
    public ResponseEntity<List<Permission>> list() {
        return ResponseEntity.ok(permissionService.findAll());
    }
}






