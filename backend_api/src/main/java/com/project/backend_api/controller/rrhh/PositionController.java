package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.PositionDto;
import com.project.backend_api.service.rrhh.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_VIEW', 'ROLE_ROOT')")
    public ResponseEntity<List<PositionDto>> getAll() {
        return ResponseEntity.ok(positionService.getAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_VIEW', 'ROLE_ROOT')")
    public ResponseEntity<List<PositionDto>> getActive() {
        return ResponseEntity.ok(positionService.getActive());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_VIEW', 'ROLE_ROOT')")
    public ResponseEntity<PositionDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(positionService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_EDIT', 'ROLE_ROOT')")
    public ResponseEntity<PositionDto> create(@RequestBody PositionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(positionService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_EDIT', 'ROLE_ROOT')")
    public ResponseEntity<PositionDto> update(@PathVariable UUID id, @RequestBody PositionDto dto) {
        return ResponseEntity.ok(positionService.update(id, dto));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_EDIT', 'ROLE_ROOT')")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID id) {
        positionService.toggleActive(id);
        return ResponseEntity.noContent().build();
    }
}
