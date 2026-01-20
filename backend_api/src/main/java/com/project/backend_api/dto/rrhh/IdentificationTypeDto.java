package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdentificationTypeDto {
    private UUID id;
    private String code;
    private String name;

    // País
    private UUID countryId;
    private String countryName;

    private String validationRegex;
    private Boolean active;

    // Metadata
    private Boolean isGlobal;
}
