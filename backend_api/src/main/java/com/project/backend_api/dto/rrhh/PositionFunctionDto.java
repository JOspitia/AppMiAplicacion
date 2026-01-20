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
public class PositionFunctionDto {
    private UUID id;
    private String description;
    private Integer displayOrder;
}
