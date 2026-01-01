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
public class EmployeeDto {
    private UUID id;
    private UUID companyId;
    private UUID userId;

    private String firstName;
    private String lastName;

    private String identificationType;
    private String identificationNumber;

    private String emailCorporate;
    private String phoneMobile;

    private String position; // Cargo if we had it, but model doesn't show it explicitly yet except via Role
                             // maybe?
    // Wait, looking at Employee entity, there is no Position field?
    // Ah, I missed checking unrelated fields. I'll stick to Entity fields.

    private Boolean active;
}



