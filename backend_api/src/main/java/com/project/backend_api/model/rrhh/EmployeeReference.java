package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "employee_references", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeReference extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "occupation", length = 255)
    private String occupation; // Cargo / Título

    @Column(name = "company", length = 150)
    private String company;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "mobile", length = 50)
    private String mobile;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;
}
