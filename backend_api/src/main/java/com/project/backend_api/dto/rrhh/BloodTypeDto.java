package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BloodTypeDto {
    private UUID id;
    private String name;
}
