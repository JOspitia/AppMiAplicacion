package com.project.backend_api.model.core;

import com.project.backend_api.model.core.management.Company;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Categorías de documentos para agrupar tipos de documentos por
 * módulo/contexto.
 * (RRHH, Almacén, Contabilidad, etc.)
 */
@Entity
@Table(name = "document_categories", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCategory extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
