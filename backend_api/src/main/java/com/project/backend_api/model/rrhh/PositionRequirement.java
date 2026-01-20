package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "position_requirements", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionRequirement extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    @Column(name = "requirement_type", nullable = false, length = 50)
    private String requirementType; // EDUCATION, CERTIFICATION, LICENSE, OTHER

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    // Tipos de requisitos
    public static final String TYPE_EDUCATION = "EDUCATION";
    public static final String TYPE_CERTIFICATION = "CERTIFICATION";
    public static final String TYPE_LICENSE = "LICENSE";
    public static final String TYPE_OTHER = "OTHER";
}
