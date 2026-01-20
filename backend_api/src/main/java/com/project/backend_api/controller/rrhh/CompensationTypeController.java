package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.CompensationTypeDto;
import com.project.backend_api.service.rrhh.CompensationTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/compensation-types")
@RequiredArgsConstructor
public class CompensationTypeController {

    private final CompensationTypeService service;

    @GetMapping
    public ResponseEntity<List<CompensationTypeDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CompensationTypeDto>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompensationTypeDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CompensationTypeDto> create(@RequestBody CompensationTypeDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompensationTypeDto> update(@PathVariable UUID id, @RequestBody CompensationTypeDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID id) {
        service.toggleActive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Dropdown Options ---

    @GetMapping("/options/periodicities")
    public ResponseEntity<List<CompensationTypeService.OptionDto>> getPeriodicities() {
        return ResponseEntity.ok(service.getPeriodicityOptions());
    }

    @GetMapping("/options/calculation-bases")
    public ResponseEntity<List<CompensationTypeService.OptionDto>> getCalculationBases() {
        return ResponseEntity.ok(service.getCalculationBaseOptions());
    }
}
