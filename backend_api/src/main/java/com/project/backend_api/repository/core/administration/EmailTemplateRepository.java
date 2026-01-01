package com.project.backend_api.repository.core.administration;

import com.project.backend_api.model.core.administration.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {

    Optional<EmailTemplate> findByTemplateKeyAndActiveTrue(String templateKey);

    Optional<EmailTemplate> findByTemplateKey(String templateKey);
}
