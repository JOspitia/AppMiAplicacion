package com.project.backend_api.dto.rrhh;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ContractTypeDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean hasEndDate;
    private Integer defaultDuration;
    private String durationUnit; // DAYS, MONTHS, YEARS
    private Boolean active;
}
