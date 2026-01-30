package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employee_documents", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id")
    private DocumentType documentType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "is_unified")
    @Builder.Default
    private Boolean isUnified = false;

    /**
     * Validates that unified documents don't have a document type
     * and individual documents must have a document type
     */
    @PrePersist
    @PreUpdate
    private void validateDocumentType() {
        if (Boolean.TRUE.equals(isUnified) && documentType != null) {
            throw new IllegalStateException("Unified documents cannot have a document type");
        }
        if (Boolean.FALSE.equals(isUnified) && documentType == null) {
            throw new IllegalStateException("Individual documents must have a document type");
        }
    }
}
