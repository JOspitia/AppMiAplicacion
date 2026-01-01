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
public class CompanySummaryDto {
    private UUID id;
    private String name;
    private String nit;
    private String logoUrl;
    private String primaryColor;
}





