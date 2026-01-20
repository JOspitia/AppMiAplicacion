package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.administration.Country;
import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entidad que representa los tipos de documentos de identificación personal
 * (Cédula de Ciudadanía, Pasaporte, Tarjeta de Identidad, etc.)
 * 
 * Tabla: public.identification_types
 * Modelo Híbrido:
 * - company_id IS NULL -> Global (Solo lectura)
 * - company_id IS VALID -> Específico de compañia (Editable)
 */
@Entity
@Table(name = "identification_types", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentificationType extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = true) // Nullable para permitir globales
    private Company company;

    /**
     * Código corto único (CC, TI, CE, PASSPORT, NIT)
     */
    @Column(nullable = false, length = 20)
    private String code;

    /**
     * Nombre descriptivo del tipo de identificación
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * País al que aplica el documento. NULL = Global
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;

    /**
     * Expresión regular para validar el formato del número
     */
    @Column(name = "validation_regex", length = 100)
    private String validationRegex;

    /**
     * Estado activo/inactivo
     */
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (active == null) {
            active = true;
        }
        // Normalizar código a mayúsculas
        if (code != null) {
            code = code.toUpperCase().trim();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Normalizar código a mayúsculas
        if (code != null) {
            code = code.toUpperCase().trim();
        }
    }
}
