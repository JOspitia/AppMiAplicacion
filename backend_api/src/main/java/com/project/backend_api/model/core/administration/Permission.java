package com.project.backend_api.model.core.administration;



import com.project.backend_api.model.core.management.Company;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "permissions", schema = "security")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private PermissionCategory category;

    @Deprecated
    @Column(name = "category")
    private String category_old; // Marked the old string category for migration path

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "is_system", columnDefinition = "boolean default false")
    private Boolean isSystem;
}







