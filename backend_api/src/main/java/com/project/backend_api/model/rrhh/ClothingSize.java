package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "clothing_sizes", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingSize extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 50)
    private String name; // S, M, L, XL...

    @Column(nullable = false, length = 50)
    private String category; // SHIRT, PANTS, SHOES

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Builder.Default
    private Boolean active = true;
}
