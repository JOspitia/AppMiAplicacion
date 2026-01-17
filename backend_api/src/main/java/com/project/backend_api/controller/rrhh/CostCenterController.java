package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.CostCenterDto;
import com.project.backend_api.service.rrhh.CostCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/cost-centers")
@RequiredArgsConstructor
public class CostCenterController {

    private final CostCenterService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_COST_CENTER_VIEW')")
    public ResponseEntity<List<CostCenterDto>> getAll(@RequestParam(required = false) Boolean active) {
        if (active != null && active) {
            return ResponseEntity.ok(service.getActiveCostCenters());
        }
        return ResponseEntity.ok(service.getAllCostCenters());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_COST_CENTER_VIEW')")
    public ResponseEntity<CostCenterDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getCostCenterById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_COST_CENTER_EDIT')")
    public ResponseEntity<CostCenterDto> create(@RequestBody CostCenterDto dto) {
        return ResponseEntity.ok(service.saveCostCenter(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_COST_CENTER_EDIT')")
    public ResponseEntity<CostCenterDto> update(@PathVariable UUID id, @RequestBody CostCenterDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(service.saveCostCenter(dto));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('RRHH_COST_CENTER_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        service.toggleActiveStatus(id);
        return ResponseEntity.noContent().build();
    }
}
