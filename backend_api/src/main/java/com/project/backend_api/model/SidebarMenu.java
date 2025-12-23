package com.project.backend_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "sidebar_menu", schema = "configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id")
    private SaasModule module;

    @Column(nullable = false)
    private String title;

    private String url;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    private SidebarMenu parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<SidebarMenu> children = new ArrayList<>();

    @Column(name = "order_index")
    private Integer orderIndex;

    private String icon;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "permission_required")
    private String permissionRequired;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
