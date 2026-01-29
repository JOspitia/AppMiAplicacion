package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeReferenceDto {
    private UUID id;
    private UUID employeeId;
    private String referenceType; // LABORAL, PERSONAL, FAMILIAR
    private String name;
    private String occupation;
    private String company;
    private String phone;
    private String mobile;
    private String attachmentUrl;
}
