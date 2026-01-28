package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeWorkExperienceDto {
    private UUID id;
    private String companyName;
    private String positionHeld;
    private String immediateSupervisor;
    private String companyPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private String functions;
    private String attachmentUrl;
}
