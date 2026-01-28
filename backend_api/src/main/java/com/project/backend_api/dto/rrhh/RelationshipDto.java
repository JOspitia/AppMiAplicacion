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
public class RelationshipDto {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private Boolean isFamily;
    private Boolean active;
    private Integer displayOrder;
}
