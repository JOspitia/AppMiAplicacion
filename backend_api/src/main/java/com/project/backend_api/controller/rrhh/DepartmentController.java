package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.DepartmentDto;
import com.project.backend_api.service.rrhh.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_DEPT_VIEW')")
    public ResponseEntity<List<DepartmentDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('RRHH_DEPT_VIEW')")
    public ResponseEntity<List<DepartmentDto>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_DEPT_VIEW')")
    public ResponseEntity<DepartmentDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_DEPT_CREATE')")
    public ResponseEntity<DepartmentDto> create(@RequestBody DepartmentDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<DepartmentDto> update(@PathVariable UUID id, @RequestBody DepartmentDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('RRHH_DEPT_EDIT')")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID id) {
        service.toggleActive(id);
        return ResponseEntity.ok().build();
    }
}
