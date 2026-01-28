package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.EmployeeListDto;
import com.project.backend_api.dto.rrhh.EmployeePersonalStepDto;
import com.project.backend_api.service.rrhh.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
