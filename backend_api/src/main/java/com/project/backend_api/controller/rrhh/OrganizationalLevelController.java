package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.OrganizationalLevelDto;
import com.project.backend_api.service.rrhh.OrganizationalLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/organizational-levels")
@RequiredArgsConstructor
public class OrganizationalLevelController {

    private final OrganizationalLevelService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_DEPT_VIEW')")
    public ResponseEntity<List<OrganizationalLevelDto>> getAll(@RequestParam(required = false) Boolean active) {
        if (active != null && active) {
            return ResponseEntity.ok(service.getActive());
        }
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_DEPT_VIEW')")
    public ResponseEntity<OrganizationalLevelDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<OrganizationalLevelDto> create(@RequestBody OrganizationalLevelDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<OrganizationalLevelDto> update(@PathVariable UUID id,
            @RequestBody OrganizationalLevelDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        service.toggleActive(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<Void> reorder(@RequestBody List<UUID> orderedIds) {
        service.updateOrder(orderedIds);
        return ResponseEntity.noContent().build();
    }
}
