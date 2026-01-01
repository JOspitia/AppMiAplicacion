package com.project.backend_api.dto.core.administration;



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
    private String displayName;
    private String description;
    private String moduleName;
    private String resourceName;
    private String category;
    private String categoryDescription;
    private String categoryIcon; // Added for UI integration
    private String actionType;
    private Boolean isSystem;
}





