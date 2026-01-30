package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeContractStepDto {

    private UUID employeeId;

    // Contract Details
    private UUID contractTypeId;
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate probationEndDate;
    private UUID workScheduleId;
    private String comments;

    // Document metadata (files handled separately in multipart)
    // Frontend will send: documents[documentTypeId] = file
    // and documentExpiry[documentTypeId] = date
}
