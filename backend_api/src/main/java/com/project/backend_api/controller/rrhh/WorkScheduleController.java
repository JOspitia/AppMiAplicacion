package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.WorkScheduleDto;
import com.project.backend_api.dto.rrhh.WorkScheduleDayDto;
import com.project.backend_api.dto.rrhh.WorkScheduleTimeSlotDto;
import com.project.backend_api.model.rrhh.WorkSchedule;
import com.project.backend_api.model.rrhh.WorkScheduleDay;
import com.project.backend_api.service.rrhh.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rrhh/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_VIEW')")
    public ResponseEntity<List<WorkScheduleDto>> getAll() {
        return ResponseEntity.ok(service.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_VIEW')")
    public ResponseEntity<List<WorkScheduleDto>> getAllActive() {
        return ResponseEntity.ok(service.findAllActive().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_VIEW')")
    public ResponseEntity<WorkScheduleDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(convertToDto(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_CREATE')")
    public ResponseEntity<WorkScheduleDto> create(@RequestBody WorkScheduleDto dto) {
        WorkSchedule entity = convertToEntity(dto);
        return ResponseEntity.ok(convertToDto(service.save(entity)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_EDIT')")
    public ResponseEntity<WorkScheduleDto> update(@PathVariable UUID id, @RequestBody WorkScheduleDto dto) {
        WorkSchedule entity = convertToEntity(dto);
        entity.setId(id);
        return ResponseEntity.ok(convertToDto(service.save(entity)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('RRHH_WORK_SCHEDULE_EDIT')")
    public ResponseEntity<WorkScheduleDto> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(convertToDto(service.toggleActive(id)));
    }

    private WorkScheduleDto convertToDto(WorkSchedule entity) {
        return WorkScheduleDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .scheduleType(entity.getScheduleType())
                .cycleLengthDays(entity.getCycleLengthDays())
                .toleranceMinutes(entity.getToleranceMinutes())
                .color(entity.getColor())
                .maxWeeklyHours(entity.getMaxWeeklyHours())
                .totalWeeklyHours(entity.getTotalWeeklyHours())
                .active(entity.getActive())
                .days(entity.getDays() != null ? entity.getDays().stream()
                        .map(this::convertDayToDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    private WorkScheduleDayDto convertDayToDto(WorkScheduleDay day) {
        return WorkScheduleDayDto.builder()
                .id(day.getId())
                .dayNumber(day.getDayNumber())
                .isRestDay(day.getIsRestDay())
                .startTime(day.getStartTime())
                .endTime(day.getEndTime())
                .isNextDay(day.getIsNextDay())
                .breakMinutes(day.getBreakMinutes())
                .timeSlots(day.getTimeSlots() != null ? day.getTimeSlots().stream()
                        .map(this::convertSlotToDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    private WorkScheduleTimeSlotDto convertSlotToDto(com.project.backend_api.model.rrhh.WorkScheduleTimeSlot slot) {
        return WorkScheduleTimeSlotDto.builder()
                .id(slot.getId())
                .slotOrder(slot.getSlotOrder())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isNextDay(slot.getIsNextDay())
                .breakMinutes(slot.getBreakMinutes())
                .build();
    }

    private WorkSchedule convertToEntity(WorkScheduleDto dto) {
        WorkSchedule schedule = WorkSchedule.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .scheduleType(dto.getScheduleType())
                .cycleLengthDays(dto.getCycleLengthDays())
                .toleranceMinutes(dto.getToleranceMinutes())
                .color(dto.getColor())
                .maxWeeklyHours(dto.getMaxWeeklyHours())
                .totalWeeklyHours(dto.getTotalWeeklyHours())
                .active(dto.getActive())
                .build();

        if (dto.getDays() != null) {
            List<WorkScheduleDay> days = dto.getDays().stream()
                    .map(this::convertDayToEntity)
                    .collect(Collectors.toList());
            days.forEach(schedule::addDay);
        }

        return schedule;
    }

    private WorkScheduleDay convertDayToEntity(WorkScheduleDayDto dto) {
        WorkScheduleDay day = WorkScheduleDay.builder()
                .id(dto.getId())
                .dayNumber(dto.getDayNumber())
                .isRestDay(dto.getIsRestDay())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isNextDay(dto.getIsNextDay())
                .breakMinutes(dto.getBreakMinutes())
                .build();

        if (dto.getTimeSlots() != null) {
            List<com.project.backend_api.model.rrhh.WorkScheduleTimeSlot> slots = dto.getTimeSlots().stream()
                    .map(slotDto -> convertSlotToEntity(slotDto, day))
                    .collect(Collectors.toList());
            day.setTimeSlots(slots);
        }

        return day;
    }

    private com.project.backend_api.model.rrhh.WorkScheduleTimeSlot convertSlotToEntity(WorkScheduleTimeSlotDto dto,
            WorkScheduleDay day) {
        return com.project.backend_api.model.rrhh.WorkScheduleTimeSlot.builder()
                .id(dto.getId())
                .workScheduleDay(day)
                .slotOrder(dto.getSlotOrder())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .isNextDay(dto.getIsNextDay())
                .breakMinutes(dto.getBreakMinutes())
                .build();
    }
}
