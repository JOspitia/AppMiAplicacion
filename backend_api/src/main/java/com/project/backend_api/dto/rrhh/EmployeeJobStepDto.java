package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeJobStepDto {

    private UUID employeeId;
    private String firstName;
    private String lastName;
    private String companyDomain;

    // Organizational Structure
    private UUID costCenterId;
    private UUID departmentId;
    private UUID locationId;
    private UUID operationalCenterId;
    private UUID positionId;
    private UUID managerId; // Supervisor/Jefe Inmediato

    // Compensation
    private BigDecimal salary;
    private String currencyCode;
    private Boolean transportAid; // Auxilio de Transporte

    // Corporate Account
    private String email; // Email corporativo

    // Bonuses/Deductions
    private List<EmployeeBonusDto> bonuses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeeBonusDto {
        private UUID id;
        private UUID compensationTypeId;
        private String compensationTypeName;
        private BigDecimal amount;
        private BigDecimal percentage;
        private UUID currencyId;
        private String currencyCode;
        private String periodicity;
        private UUID periodicityId;
        private LocalDate startDate;
        private LocalDate endDate;
        private UUID costCenterId;

        // Additional metadata for UI
        private String category; // EARNING, DEDUCTION
        private Boolean isSalary;
        private Boolean isVariable;
    }
}
