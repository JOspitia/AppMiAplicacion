package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.administration.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "positions", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Position extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizational_level_id", nullable = false)
    private OrganizationalLevel organizationalLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "min_salary", precision = 15, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "max_salary", precision = 15, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "risk_level", length = 10)
    private String riskLevel;

    @Builder.Default
    private Boolean active = true;

    // Relaciones OneToMany para detalles del cargo
    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("displayOrder ASC")
    private List<PositionFunction> functions = new ArrayList<>();

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("displayOrder ASC")
    private List<PositionSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("displayOrder ASC")
    private List<PositionRequirement> requirements = new ArrayList<>();

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("displayOrder ASC")
    private List<PositionExperience> experiences = new ArrayList<>();

    // Helper methods
    public void addFunction(PositionFunction function) {
        functions.add(function);
        function.setPosition(this);
    }

    public void removeFunction(PositionFunction function) {
        functions.remove(function);
        function.setPosition(null);
    }

    public void addSkill(PositionSkill skill) {
        skills.add(skill);
        skill.setPosition(this);
    }

    public void removeSkill(PositionSkill skill) {
        skills.remove(skill);
        skill.setPosition(null);
    }

    public void addRequirement(PositionRequirement requirement) {
        requirements.add(requirement);
        requirement.setPosition(this);
    }

    public void removeRequirement(PositionRequirement requirement) {
        requirements.remove(requirement);
        requirement.setPosition(null);
    }

    public void addExperience(PositionExperience experience) {
        experiences.add(experience);
        experience.setPosition(this);
    }

    public void removeExperience(PositionExperience experience) {
        experiences.remove(experience);
        experience.setPosition(null);
    }

    @PrePersist
    protected void onCreate() {
        if (active == null) {
            active = true;
        }
    }
}
