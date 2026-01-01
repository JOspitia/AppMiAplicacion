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
public class OperationalCenterDto {
    private UUID id;
    private UUID companyId;
    private String code;
    private String name;
    private String description;
    private UUID locationId;
    private String locationName;
    private Boolean active;
}


