package com.project.backend_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.Set;
import java.time.LocalDateTime;
import java.util.HashSet;

@Entity
@Table(name = "roles", schema = "security")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "is_system_role")
    @Builder.Default
    private Boolean isSystemRole = false;

    @Column(name = "is_admin_role")
    @Builder.Default
    private Boolean isAdminRole = false;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "role_permissions", schema = "security", joinColumns = @JoinColumn(name = "role_id"), inverseJoinColumns = @JoinColumn(name = "permission_id"))
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();
}
