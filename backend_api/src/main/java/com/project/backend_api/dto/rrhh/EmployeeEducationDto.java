package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEducationDto {
    private UUID id;
    private UUID employeeId;
    private UUID educationLevelId;
    private String educationLevelName;
    private String institution;
    private String titleObtained;
    private Integer currentSemester;
    private String phone;
    private UUID cityId;
    private String cityName;
    private Integer startYear;
    private Integer endYear;
    private Integer hours;
    private String attachmentUrl;
}
