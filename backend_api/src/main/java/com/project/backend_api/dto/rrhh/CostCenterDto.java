package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostCenterDto {
    private UUID id;
    private String code;
    private String name;
    private BigDecimal budget;
    private UUID currencyId;
    private String currencyCode;
    private String currencySymbol;
    private BigDecimal transportAidThreshold;
    private String description;
    private Boolean active;
}
