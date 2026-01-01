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
public class LocationDto {
    private UUID id;
    private UUID companyId;
    private String name;
    private String address;
    private String city;
    private String department;
    private String country;
    private Boolean isMain;
    private Boolean active;
}






