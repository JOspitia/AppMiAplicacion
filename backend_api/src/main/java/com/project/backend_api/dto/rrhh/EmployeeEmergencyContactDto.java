package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEmergencyContactDto {
    private UUID id;
    private String firstName;
    private String secondName;
    private String firstLastName;
    private String secondLastName;

    private String relationship;
    private UUID relationshipId;
    private String phone;
}
