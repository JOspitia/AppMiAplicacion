package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.service.rrhh.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rrhh/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeListDto>> getAll() {
        return ResponseEntity.ok(employeeService.getAll());
    }

    @GetMapping("/{id}/personal")
    public ResponseEntity<EmployeePersonalStepDto> getPersonalData(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getPersonalData(id));
    }

    @PostMapping("/step1")
    public ResponseEntity<EmployeePersonalStepDto> createStep1(@RequestBody EmployeePersonalStepDto dto) {
        return ResponseEntity.ok(employeeService.createStep1(dto));
    }

    @PutMapping("/{id}/step1")
    public ResponseEntity<EmployeePersonalStepDto> updateStep1(@PathVariable UUID id,
            @RequestBody EmployeePersonalStepDto dto) {
        return ResponseEntity.ok(employeeService.updateStep1(id, dto));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable UUID id) {
        employeeService.toggleActive(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/contract")
    public ResponseEntity<EmployeeContractStepDto> getContractData(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getContractData(id));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<EmployeeDocumentDto>> getEmployeeDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeDocuments(id));
    }

    @PostMapping("/{id}/step2")
    public ResponseEntity<Void> updateStep2(
            @PathVariable UUID id,
            @RequestParam("data") String dataJson,
            MultipartHttpServletRequest request) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        EmployeeContractStepDto dto = mapper.readValue(dataJson, EmployeeContractStepDto.class);

        List<DocumentFileDto> files = new ArrayList<>();

        // Handle individual documents
        request.getFileMap().forEach((key, file) -> {
            if (key.startsWith("documents[")) {
                String typeIdStr = key.substring(10, key.length() - 1);
                UUID typeId = UUID.fromString(typeIdStr);

                String expiryKey = "documentExpiry[" + typeIdStr + "]";
                String expiryStr = request.getParameter(expiryKey);
                LocalDate expiry = (expiryStr != null && !expiryStr.isEmpty()) ? LocalDate.parse(expiryStr) : null;

                files.add(DocumentFileDto.builder()
                        .documentTypeId(typeId)
                        .file(file)
                        .expirationDate(expiry)
                        .isUnified(false)
                        .build());
            } else if (key.equals("unifiedDocument")) {
                files.add(DocumentFileDto.builder()
                        .file(file)
                        .isUnified(true)
                        .build());
            }
        });

        employeeService.updateStep2(id, dto, files);
        return ResponseEntity.ok().build();
    }
}
