package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.Location;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "departments", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizational_level_id")
    private OrganizationalLevel organizationalLevel;

    // Mapping Manager Position as UUID for now since Position entity is not yet
    // migrated
    @Column(name = "manager_position_id")
    private UUID managerPositionId;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private Boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "department_locations", schema = "business_rrhh", joinColumns = @JoinColumn(name = "department_id"), inverseJoinColumns = @JoinColumn(name = "location_id"))
    @Builder.Default
    private Set<Location> locations = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (active == null) {
            active = true;
        }
    }
}
