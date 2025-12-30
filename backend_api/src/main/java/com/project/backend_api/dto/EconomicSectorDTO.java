package com.project.backend_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EconomicSectorDTO {
    private UUID id;
    private String name;
    private String description;
    private Boolean active;
}
