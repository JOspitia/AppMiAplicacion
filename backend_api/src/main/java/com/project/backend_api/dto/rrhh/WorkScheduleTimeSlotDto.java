package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleTimeSlotDto {
    private UUID id;
    private Integer slotOrder;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isNextDay;
    private Integer breakMinutes;
}
