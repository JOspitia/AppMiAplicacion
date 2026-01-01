package com.project.backend_api.controller.core.administration;



import com.project.backend_api.repository.core.administration.CityRepository;
import com.project.backend_api.repository.core.administration.CountryRepository;
import com.project.backend_api.repository.core.administration.CurrencyRepository;
import com.project.backend_api.repository.core.administration.StateRepository;
import com.project.backend_api.service.core.administration.GeoSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/core/administration/geo/sync")
@RequiredArgsConstructor
public class GeoSyncController {

    private final GeoSyncService geoSyncService;
    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final CurrencyRepository currencyRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('CORE_ADMINISTRATION_VIEW') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("countries", countryRepository.count());
        stats.put("states", stateRepository.count());
        stats.put("cities", cityRepository.count());
        stats.put("currencies", currencyRepository.count());
        stats.put("phoneCodes", countryRepository.countByPhoneCodeIsNotNull());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/run")
    @PreAuthorize("hasAuthority('CORE_ADMINISTRATION_EDIT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<GeoSyncService.SyncResult> runSync() {
        return ResponseEntity.ok(geoSyncService.syncLocations());
    }
}






