package com.project.backend_api.controller.core.management;

import com.project.backend_api.dto.core.management.LocationDto;
import com.project.backend_api.service.core.management.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/core/management/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_LOCATION_VIEW')")
    public ResponseEntity<List<LocationDto>> getAll() {
        return ResponseEntity.ok(service.getAllLocations());
    }

    @GetMapping("/active")
    public ResponseEntity<List<LocationDto>> getActive() {
        return ResponseEntity.ok(service.getActiveLocations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_LOCATION_VIEW')")
    public ResponseEntity<LocationDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getLocationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_LOCATION_EDIT')")
    public ResponseEntity<LocationDto> create(@RequestBody LocationDto dto) {
        return ResponseEntity.ok(service.saveLocation(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_LOCATION_EDIT')")
    public ResponseEntity<LocationDto> update(@PathVariable UUID id, @RequestBody LocationDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(service.saveLocation(dto));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('RRHH_LOCATION_EDIT')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) {
        service.toggleActive(id);
        return ResponseEntity.noContent().build();
    }
}
