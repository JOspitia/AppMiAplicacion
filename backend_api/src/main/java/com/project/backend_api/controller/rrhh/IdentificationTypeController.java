package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.IdentificationTypeDto;
import com.project.backend_api.service.rrhh.IdentificationTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/identification-types")
@RequiredArgsConstructor
public class IdentificationTypeController {

    private final IdentificationTypeService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<List<IdentificationTypeDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<List<IdentificationTypeDto>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<IdentificationTypeDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<IdentificationTypeDto> create(@RequestBody IdentificationTypeDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<IdentificationTypeDto> update(@PathVariable UUID id, @RequestBody IdentificationTypeDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID id) {
        service.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
