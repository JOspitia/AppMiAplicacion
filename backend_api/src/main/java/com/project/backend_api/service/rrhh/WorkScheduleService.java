package com.project.backend_api.service.rrhh;

import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.WorkSchedule;
import com.project.backend_api.model.rrhh.WorkScheduleDay;
import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.repository.rrhh.WorkScheduleRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkScheduleService {

    private final WorkScheduleRepository repository;
    private final CompanyRepository companyRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<WorkSchedule> findAll() {
        return repository.findByCompanyId(getCurrentCompanyId());
    }

    public List<WorkSchedule> findAllActive() {
        return repository.findByCompanyIdAndActiveTrue(getCurrentCompanyId());
    }

    public WorkSchedule findById(UUID id) {
        return repository.findById(id)
                .filter(ws -> ws.getCompany().getId().equals(getCurrentCompanyId()))
                .orElseThrow(() -> new RuntimeException("Horario laboral no encontrado"));
    }

    @Transactional
    public WorkSchedule save(WorkSchedule workSchedule) {
        if (isNameDuplicated(workSchedule)) {
            throw new IllegalArgumentException("Ya existe un horario laboral con este nombre.");
        }

        if (workSchedule.getId() == null) {
            Company company = companyRepository.findById(getCurrentCompanyId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            workSchedule.setCompany(company);

            if (workSchedule.getActive() == null) {
                workSchedule.setActive(true);
            }
        } else {
            WorkSchedule existing = findById(workSchedule.getId());

            // Update main fields
            existing.setName(workSchedule.getName());
            existing.setDescription(workSchedule.getDescription());
            existing.setScheduleType(workSchedule.getScheduleType());
            existing.setCycleLengthDays(workSchedule.getCycleLengthDays());
            existing.setToleranceMinutes(workSchedule.getToleranceMinutes());
            existing.setColor(workSchedule.getColor());
            existing.setMaxWeeklyHours(workSchedule.getMaxWeeklyHours());
            existing.setTotalWeeklyHours(workSchedule.getTotalWeeklyHours());

            if (workSchedule.getActive() != null) {
                existing.setActive(workSchedule.getActive());
            }

            // Update days - clear and re-add
            existing.clearDays();
            if (workSchedule.getDays() != null) {
                workSchedule.getDays().forEach(existing::addDay);
            }

            workSchedule = existing;
        }

        // Ensure bidirectional relationship
        final WorkSchedule scheduleToSave = workSchedule;
        if (scheduleToSave.getDays() != null) {
            scheduleToSave.getDays().forEach(day -> day.setWorkSchedule(scheduleToSave));
        }

        // Calculate total weekly hours
        calculateTotalWeeklyHours(scheduleToSave);

        return repository.save(scheduleToSave);
    }

    private void calculateTotalWeeklyHours(WorkSchedule schedule) {
        if (schedule.getDays() == null || schedule.getDays().isEmpty()) {
            schedule.setTotalWeeklyHours(0.0);
            return;
        }

        double totalHours = 0.0;
        for (WorkScheduleDay day : schedule.getDays()) {
            if (Boolean.TRUE.equals(day.getIsRestDay())) {
                continue;
            }

            double dayHours = 0.0;

            // If day has time slots (split shift), use them.
            if (day.getTimeSlots() != null && !day.getTimeSlots().isEmpty()) {
                for (com.project.backend_api.model.rrhh.WorkScheduleTimeSlot slot : day.getTimeSlots()) {
                    dayHours += calculateDuration(slot.getStartTime(), slot.getEndTime(), slot.getIsNextDay(),
                            slot.getBreakMinutes());
                }
            } else {
                // Fallback to legacy single shift fields
                dayHours = calculateDuration(day.getStartTime(), day.getEndTime(), day.getIsNextDay(),
                        day.getBreakMinutes());
            }

            totalHours += dayHours;
        }

        // For CYCLICAL schedules, normalize to weekly average
        if ("CYCLICAL".equals(schedule.getScheduleType()) && schedule.getCycleLengthDays() != null
                && schedule.getCycleLengthDays() > 0) {
            totalHours = (totalHours / schedule.getCycleLengthDays()) * 7;
        }

        // Round to 1 decimal to match frontend display
        schedule.setTotalWeeklyHours(Math.round(totalHours * 10.0) / 10.0);
    }

    private double calculateDuration(java.time.LocalTime start, java.time.LocalTime end, Boolean isNextDay,
            Integer breakMinutes) {
        if (start == null || end == null)
            return 0.0;

        int startMinutes = start.getHour() * 60 + start.getMinute();
        int endMinutes = end.getHour() * 60 + end.getMinute();

        // Handle 24-hour shifts (start == end AND isNextDay == true)
        if (startMinutes == endMinutes && Boolean.TRUE.equals(isNextDay)) {
            int duration = 1440 - (breakMinutes != null ? breakMinutes : 0);
            return Math.max(0, duration) / 60.0;
        }

        // Use modular arithmetic logic similar to frontend
        int diff = endMinutes - startMinutes;
        if (Boolean.TRUE.equals(isNextDay)) {
            diff += 1440;
        } else if (diff < 0) {
            // "Auto-Amanecida" logic for backend too: if end < start, assume next day
            diff += 1440;
        }

        int workMinutes = diff - (breakMinutes != null ? breakMinutes : 0);
        return Math.max(0, workMinutes) / 60.0;
    }

    private boolean isNameDuplicated(WorkSchedule workSchedule) {
        if (workSchedule.getId() == null) {
            return repository.existsByCompanyIdAndName(getCurrentCompanyId(), workSchedule.getName());
        } else {
            return repository.existsByCompanyIdAndNameAndIdNot(getCurrentCompanyId(), workSchedule.getName(),
                    workSchedule.getId());
        }
    }

    @Transactional
    public void delete(UUID id) {
        WorkSchedule existing = findById(id);
        repository.delete(existing);
    }

    @Transactional
    public WorkSchedule toggleActive(UUID id) {
        WorkSchedule existing = findById(id);
        existing.setActive(!Boolean.TRUE.equals(existing.getActive()));
        return repository.save(existing);
    }
}
