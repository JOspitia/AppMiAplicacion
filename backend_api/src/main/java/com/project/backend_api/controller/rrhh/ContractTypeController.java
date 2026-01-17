package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.ContractTypeDto;
import com.project.backend_api.model.rrhh.ContractType;
import com.project.backend_api.service.rrhh.ContractTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rrhh/contract-types")
@RequiredArgsConstructor
public class ContractTypeController {

    private final ContractTypeService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<List<ContractTypeDto>> getAll() {
        return ResponseEntity.ok(service.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<List<ContractTypeDto>> getAllActive() {
        return ResponseEntity.ok(service.findAllActive().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_VIEW')")
    public ResponseEntity<ContractTypeDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(convertToDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<ContractTypeDto> create(@RequestBody ContractTypeDto dto) {
        ContractType entity = convertToEntity(dto);
        return ResponseEntity.ok(convertToDto(service.save(entity)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<ContractTypeDto> update(@PathVariable UUID id, @RequestBody ContractTypeDto dto) {
        ContractType entity = convertToEntity(dto);
        entity.setId(id);
        return ResponseEntity.ok(convertToDto(service.save(entity)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('RRHH_CONFIG_EDIT')")
    public ResponseEntity<ContractTypeDto> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(convertToDto(service.toggleActive(id)));
    }

    private ContractTypeDto convertToDto(ContractType entity) {
        return ContractTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .hasEndDate(entity.getHasEndDate())
                .defaultDuration(entity.getDefaultDuration())
                .durationUnit(entity.getDurationUnit())
                .active(entity.getActive())
                .build();
    }

    private ContractType convertToEntity(ContractTypeDto dto) {
        return ContractType.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .hasEndDate(dto.getHasEndDate())
                .defaultDuration(dto.getDefaultDuration())
                .durationUnit(dto.getDurationUnit())
                .active(dto.getActive())
                .build();
    }
}
