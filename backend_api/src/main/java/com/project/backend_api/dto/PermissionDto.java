package com.project.backend_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto {
    private UUID id;
    private String name;
    private String description;
    private String moduleName;
    private String resourceName;
    private String category;
}
