package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeListDto {
    private UUID id;
    private String fullName;
    private String identificationNumber;
    private String emailCorporate;
    private String positionName;
    private String departmentName;
    private Boolean active;
    private String photoUrl;
}
