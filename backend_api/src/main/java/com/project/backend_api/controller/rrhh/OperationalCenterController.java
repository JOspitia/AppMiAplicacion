package com.project.backend_api.controller.rrhh;



import com.project.backend_api.dto.rrhh.OperationalCenterDto;
import com.project.backend_api.service.rrhh.OperationalCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/operational-centers")
@RequiredArgsConstructor
public class OperationalCenterController {

    private final OperationalCenterService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_OPCENTER_VIEW')")
    public ResponseEntity<List<OperationalCenterDto>> getAll(@RequestParam(required = false) Boolean active) {
        if (active != null && active) {
            return ResponseEntity.ok(service.getActiveOperationalCenters());
        }
        return ResponseEntity.ok(service.getAllOperationalCenters());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_OPCENTER_EDIT')")
    public ResponseEntity<OperationalCenterDto> create(@RequestBody OperationalCenterDto dto) {
        return ResponseEntity.ok(service.saveOperationalCenter(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_OPCENTER_EDIT')")
    public ResponseEntity<OperationalCenterDto> update(@PathVariable UUID id, @RequestBody OperationalCenterDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(service.saveOperationalCenter(dto));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('RRHH_OPCENTER_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        service.toggleActiveStatus(id);
        return ResponseEntity.noContent().build();
    }
}


