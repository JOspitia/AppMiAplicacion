package com.project.backend_api.dto.core.management;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyWebsiteDTO {
    private UUID id;
    private String url;
    private Boolean isPrimary;
    private String description;
}





