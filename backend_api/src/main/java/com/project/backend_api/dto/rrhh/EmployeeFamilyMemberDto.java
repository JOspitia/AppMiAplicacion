package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeFamilyMemberDto {
    private UUID id;
    private String firstName;
    private String secondName;
    private String firstLastName;
    private String secondLastName;

    private String relationship;
    private UUID relationshipId;
    private LocalDate birthDate;
    private String occupation;
    private UUID occupationId;
    private Boolean isDependent;
}