package com.project.backend_api.dto.rrhh;

import com.project.backend_api.model.rrhh.CompensationCategory;
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
public class CompensationTypeDto {
    private UUID id;
    private String name;
    private String code;
    private String description;

    // Enum
    private CompensationCategory category;
    private String categoryLabel; // "Ingreso" o "Deducción" para el frontend

    // Flags
    private Boolean isSalary;
    private Boolean isTaxable;
    private Boolean isVariable;
    private Boolean isReadOnly;
    private Boolean active;

    // Relaciones (IDs y Nombres para visualización)
    private UUID costCenterId;
    private String costCenterName;

    private UUID currencyId;
    private String currencyCode;

    private UUID periodicityId;
    private String periodicityName;

    private UUID calculationBaseId;
    private String calculationBaseName;

    // Valores numéricos
    private BigDecimal fixedAmount;
    private BigDecimal percentage;
    private BigDecimal targetValue;
}
