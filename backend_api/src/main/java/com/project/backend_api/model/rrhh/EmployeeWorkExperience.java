package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employee_work_experiences", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeWorkExperience extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "position_held", nullable = false, length = 255)
    private String positionHeld;

    @Column(name = "immediate_supervisor", nullable = false, length = 255)
    private String immediateSupervisor;

    @Column(name = "company_phone", length = 50)
    private String companyPhone;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String functions;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
}
