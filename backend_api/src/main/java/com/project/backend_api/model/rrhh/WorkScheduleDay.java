package com.project.backend_api.model.rrhh;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "work_schedule_days", schema = "business_rrhh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleDay implements Serializable {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_schedule_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WorkSchedule workSchedule;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber; // 1-7 for WEEKLY (Monday-Sunday) or 1-N for CYCLICAL

    @Column(name = "is_rest_day")
    @Builder.Default
    private Boolean isRestDay = false;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_next_day")
    @Builder.Default
    private Boolean isNextDay = false; // True if shift ends next day (overnight)

    @Column(name = "break_minutes")
    @Builder.Default
    private Integer breakMinutes = 60;

    /**
     * Time slots for this day (for split shifts / jornada partida).
     * If empty, the system uses the legacy fields (startTime, endTime,
     * breakMinutes).
     * If populated, the legacy fields are ignored.
     */
    @OneToMany(mappedBy = "workScheduleDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("slotOrder ASC")
    @Builder.Default
    private java.util.List<WorkScheduleTimeSlot> timeSlots = new java.util.ArrayList<>();
}
