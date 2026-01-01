package com.project.backend_api.controller.core.management;




import com.project.backend_api.dto.core.management.CompanyDto;
import com.project.backend_api.service.core.management.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/core/management/companies")
@RequiredArgsConstructor
public class CompanyManagementController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyDto>> list() {
        return ResponseEntity.ok(companyService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> get(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CompanyDto> create(@Valid @RequestBody CompanyDto company) {
        CompanyDto created = companyService.create(company);
        return ResponseEntity.created(URI.create("/api/core/companies/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable UUID id, @Valid @RequestBody CompanyDto company) {
        return ResponseEntity.ok(companyService.update(id, company));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleStatus(@PathVariable UUID id) {
        companyService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/logo")
    public ResponseEntity<?> uploadLogo(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(companyService.uploadLogo(id, file));
    }
}







