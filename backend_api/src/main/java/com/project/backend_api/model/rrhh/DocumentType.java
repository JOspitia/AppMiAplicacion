package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.DocumentCategory;
import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entidad que representa los tipos de soportes/documentos requeridos
 * (Cédula escaneada, Licencia de conducción, RETHUS, etc.)
 * 
 * Tabla: public.document_types
 */
@Entity
@Table(name = "document_types", schema = "public", uniqueConstraints = {
        @UniqueConstraint(name = "unique_document_type_name_per_company", columnNames = { "company_id", "name" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private DocumentCategory category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String code;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = false;

    @Column(name = "requires_expiration")
    @Builder.Default
    private Boolean requiresExpiration = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (active == null)
            active = true;
        if (isRequired == null)
            isRequired = false;
        if (requiresExpiration == null)
            requiresExpiration = false;
        if (code != null)
            code = code.toUpperCase().trim();
    }

    @PreUpdate
    protected void onUpdate() {
        if (code != null)
            code = code.toUpperCase().trim();
    }
}
