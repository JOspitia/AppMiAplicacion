package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.service.rrhh.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rrhh/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/relationships")
    public ResponseEntity<List<RelationshipDto>> getRelationships(@RequestParam(required = false) Boolean isFamily) {
        return ResponseEntity.ok(catalogService.getActiveRelationships(isFamily));
    }

    @GetMapping("/occupations")
    public ResponseEntity<List<OccupationDto>> getOccupations(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(catalogService.getActiveOccupations(category));
    }

    @GetMapping("/occupations/grouped")
    public ResponseEntity<Map<String, List<OccupationDto>>> getOccupationsGrouped() {
        return ResponseEntity.ok(catalogService.getOccupationsGroupedByCategory());
    }

    @GetMapping("/education-levels")
    public ResponseEntity<List<EducationLevelDto>> getEducationLevels() {
        return ResponseEntity.ok(catalogService.getActiveEducationLevels());
    }

    @GetMapping("/marital-statuses")
    public ResponseEntity<List<MaritalStatusDto>> getMaritalStatuses() {
        return ResponseEntity.ok(catalogService.getActiveMaritalStatuses());
    }

    @GetMapping("/blood-types")
    public ResponseEntity<List<BloodTypeDto>> getBloodTypes() {
        return ResponseEntity.ok(catalogService.getActiveBloodTypes());
    }

    @GetMapping("/rh-factors")
    public ResponseEntity<List<RhFactorDto>> getRhFactors() {
        return ResponseEntity.ok(catalogService.getActiveRhFactors());
    }

    @GetMapping("/experience-ranges")
    public ResponseEntity<List<ExperienceRangeDto>> getExperienceRanges() {
        return ResponseEntity.ok(catalogService.getActiveExperienceRanges());
    }

    @GetMapping("/contract-types")
    public ResponseEntity<List<ContractTypeDto>> getContractTypes() {
        return ResponseEntity.ok(catalogService.getActiveContractTypes());
    }

    @GetMapping("/work-schedules")
    public ResponseEntity<List<WorkScheduleDto>> getWorkSchedules() {
        return ResponseEntity.ok(catalogService.getActiveWorkSchedules());
    }

    @GetMapping("/document-types/hr")
    public ResponseEntity<List<DocumentTypeDto>> getHRDocumentTypes() {
        return ResponseEntity.ok(catalogService.getHRDocumentTypes());
    }
}
