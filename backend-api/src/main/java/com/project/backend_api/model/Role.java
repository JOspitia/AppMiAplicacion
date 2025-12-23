package com.project.backend_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.Set;
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

    @Builder.Default
    private Boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "role_permissions", schema = "security", joinColumns = @JoinColumn(name = "role_id"), inverseJoinColumns = @JoinColumn(name = "permission_id"))
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();
}
