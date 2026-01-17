package com.project.backend_api.dto.rrhh;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class WorkScheduleDto {
    private UUID id;
    private String name;
    private String description;
    private String scheduleType; // WEEKLY, CYCLICAL
    private Integer cycleLengthDays;
    private Integer toleranceMinutes;
    private String color;
    private Integer maxWeeklyHours;
    private Double totalWeeklyHours;
    private java.time.LocalDate referenceDate;
    private Integer firstDayOfWeek;
    private Boolean active;
    private List<WorkScheduleDayDto> days;
}
