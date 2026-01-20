package com.project.backend_api.repository.core;

import com.project.backend_api.model.core.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, UUID> {
    Optional<DocumentCategory> findByCodeAndCompanyId(String code, UUID companyId);

    List<DocumentCategory> findAllByCompanyIdOrderByCodeAsc(UUID companyId);

    List<DocumentCategory> findAllByCompanyIdAndActiveTrueOrderByCodeAsc(UUID companyId);
}
