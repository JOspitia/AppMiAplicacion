package com.project.backend_api.dto.core.administration;

import com.project.backend_api.dto.core.management.CompanySummaryDto;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String username;
    private String firstName;
    private String role;
    private List<String> permissions;
    private List<CompanySummaryDto> companies;
    private Boolean requirePasswordChange;
    private Boolean isSuperAdmin;

}




