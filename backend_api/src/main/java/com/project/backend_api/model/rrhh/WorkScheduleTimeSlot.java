package com.project.backend_api.model.rrhh;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Represents a time slot within a work schedule day.
 * Enables "split shift" or "jornada partida" configurations.
 * Example: 08:00-12:00 and 14:00-18:00 for the same day.
 */
@Entity
@Table(name = "work_schedule_time_slots", schema = "business_rrhh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleTimeSlot implements Serializable {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_schedule_day_id", nullable = false)
    private WorkScheduleDay workScheduleDay;

    /**
     * Order of this time slot within the day (1, 2, 3...).
     * Used for sorting and display purposes.
     */
    @Column(name = "slot_order", nullable = false)
    @Builder.Default
    private Integer slotOrder = 1;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * If true, the end time is on the next calendar day.
     * Example: Start 22:00, End 06:00 (next day).
     */
    @Column(name = "is_next_day")
    @Builder.Default
    private Boolean isNextDay = false;

    /**
     * Break time in minutes within this specific time slot.
     * Example: 30 minutes lunch break during the 08:00-14:00 slot.
     */
    @Column(name = "break_minutes")
    @Builder.Default
    private Integer breakMinutes = 0;
}
