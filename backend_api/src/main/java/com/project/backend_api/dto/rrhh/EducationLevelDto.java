package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationLevelDto {
    private UUID id;
    private String name;
    private String description;
    private Integer displayOrder;
}
