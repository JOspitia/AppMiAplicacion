package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "work_schedules", schema = "business_rrhh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSchedule implements Serializable {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "schedule_type", nullable = false, length = 50)
    @Builder.Default
    private String scheduleType = "WEEKLY"; // WEEKLY, CYCLICAL

    @Column(name = "cycle_length_days")
    @Builder.Default
    private Integer cycleLengthDays = 7;

    @Column(name = "tolerance_minutes")
    @Builder.Default
    private Integer toleranceMinutes = 0;

    @Column(length = 7)
    @Builder.Default
    private String color = "#3B82F6";

    @Column(name = "max_weekly_hours")
    @Builder.Default
    private Integer maxWeeklyHours = 46;

    @Column(name = "total_weekly_hours")
    private Double totalWeeklyHours;

    /**
     * Reference date for cyclical schedules.
     * Defines when Day 1 of the cycle starts (critical for 4x2, 6x1 rotations).
     * For WEEKLY schedules, this can be null.
     */
    @Column(name = "reference_date")
    private java.time.LocalDate referenceDate;

    /**
     * First day of the week (1=Monday, 7=Sunday).
     * Allows cultural adaptation (US=Sunday, ISO=Monday, Arab=Saturday).
     * Default: 1 (Monday, ISO 8601 standard).
     */
    @Column(name = "first_day_of_week")
    @Builder.Default
    private Integer firstDayOfWeek = 1;

    @OneToMany(mappedBy = "workSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkScheduleDay> days = new ArrayList<>();

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    // Helper methods
    public void addDay(WorkScheduleDay day) {
        days.add(day);
        day.setWorkSchedule(this);
    }

    public void removeDay(WorkScheduleDay day) {
        days.remove(day);
        day.setWorkSchedule(null);
    }

    public void clearDays() {
        days.forEach(day -> day.setWorkSchedule(null));
        days.clear();
    }
}
