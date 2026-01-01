package com.project.backend_api.model.core.administration;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_templates", schema = "configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_key", unique = true, nullable = false, length = 100)
    private String templateKey;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String subject;

    @Column(name = "html_content", columnDefinition = "TEXT")
    private String htmlContent;

    @Column(name = "plain_text_content", columnDefinition = "TEXT")
    private String plainTextContent;

    @Column(name = "available_placeholders", columnDefinition = "TEXT")
    private String availablePlaceholders;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}





