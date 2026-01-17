package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contract_types", schema = "business_rrhh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractType implements Serializable {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "has_end_date")
    @Builder.Default
    private Boolean hasEndDate = true;

    @Column(name = "default_duration")
    private Integer defaultDuration;

    @Column(name = "duration_unit", length = 20)
    @Builder.Default
    private String durationUnit = "MONTHS"; // DAYS, MONTHS, YEARS

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper for validation or UI
    public String getFormattedDuration() {
        if (defaultDuration == null || durationUnit == null)
            return "-";
        return defaultDuration + " " + durationUnit; // Can be enhanced with translation
    }
}
