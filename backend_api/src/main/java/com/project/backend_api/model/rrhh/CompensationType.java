package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.administration.Currency;
import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "compensation_types", schema = "business_rrhh", uniqueConstraints = {
        @UniqueConstraint(name = "unique_compensation_code_per_company", columnNames = { "company_id", "code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompensationType extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompensationCategory category; // Ingreso o Deducción

    @Column(name = "is_salary")
    @Builder.Default
    private Boolean isSalary = false;

    @Column(name = "is_taxable")
    @Builder.Default
    private Boolean isTaxable = false;

    @Column(name = "is_variable")
    @Builder.Default
    private Boolean isVariable = false;

    @Column(name = "is_read_only")
    @Builder.Default
    private Boolean isReadOnly = false;

    @Builder.Default
    private Boolean active = true;

    // --- RR.HH. Flags (Afectaciones & Cumplimiento) ---

    @Column(name = "affects_social_security")
    @Builder.Default
    private Boolean affectsSocialSecurity = false;

    @Column(name = "affects_parafiscals")
    @Builder.Default
    private Boolean affectsParafiscals = false;

    @Column(name = "affects_benefits")
    @Builder.Default
    private Boolean affectsBenefits = false;

    @Column(name = "affects_arl")
    @Builder.Default
    private Boolean affectsArl = false;

    @Column(name = "external_code", length = 50)
    private String externalCode; // Código de reporte externo (UGPP, Nómina Electrónica, Payroll Tax IDs)

    // Relaciones opcionales

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodicity_id")
    private Periodicity periodicity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculation_base_id")
    private CalculationBase calculationBase;

    // Valores

    @Column(name = "fixed_amount", precision = 19, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "target_value", precision = 19, scale = 2)
    private BigDecimal targetValue;

    @PrePersist
    protected void onCreate() {
        if (active == null)
            active = true;
        if (isSalary == null)
            isSalary = false;
        if (isTaxable == null)
            isTaxable = false;
        if (isVariable == null)
            isVariable = false;
        if (isReadOnly == null)
            isReadOnly = false;
        if (code != null)
            code = code.toUpperCase().trim();
        if (category == null)
            category = CompensationCategory.EARNING;

        // Init HR Flags
        if (affectsSocialSecurity == null)
            affectsSocialSecurity = false;
        if (affectsParafiscals == null)
            affectsParafiscals = false;
        if (affectsBenefits == null)
            affectsBenefits = false;
        if (affectsArl == null)
            affectsArl = false;

        // Business Rule Validations & Consistency
        validateAndScrubData();

        if (externalCode != null)
            externalCode = externalCode.toUpperCase().trim();
    }

    @PreUpdate
    protected void onUpdate() {
        validateAndScrubData();

        if (code != null)
            code = code.toUpperCase().trim();
        if (externalCode != null)
            externalCode = externalCode.toUpperCase().trim();
    }

    private void validateAndScrubData() {
        if (Boolean.TRUE.equals(isVariable)) {
            if (calculationBase == null) {
                throw new IllegalStateException(
                        "La Base de Cálculo es requerida para los tipos de compensación variables.");
            }
            if (percentage == null) {
                throw new IllegalStateException("El Porcentaje es requerido para los tipos de compensación variables.");
            }
            this.fixedAmount = null; // Los tipos variables no tienen monto fijo
        } else {
            if (fixedAmount == null) {
                throw new IllegalStateException(
                        "El Monto Fijo es requerido para los tipos de compensación no variables.");
            }
            this.percentage = null; // Los tipos no variables no tienen porcentaje
            this.calculationBase = null; // Los tipos no variables no tienen base de cálculo
        }
    }
}
