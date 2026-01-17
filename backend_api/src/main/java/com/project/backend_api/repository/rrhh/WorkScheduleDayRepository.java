package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.WorkScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkScheduleDayRepository extends JpaRepository<WorkScheduleDay, UUID> {
    List<WorkScheduleDay> findByWorkScheduleIdOrderByDayNumberAsc(UUID workScheduleId);

    void deleteByWorkScheduleId(UUID workScheduleId);
}
