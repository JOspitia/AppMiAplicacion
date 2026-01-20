package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, UUID> {

    List<DocumentType> findByCompanyIdOrderByNameAsc(UUID companyId);

    List<DocumentType> findByCompanyIdAndActiveTrueOrderByNameAsc(UUID companyId);

    List<DocumentType> findByCompanyIdAndCategoryCodeOrderByNameAsc(UUID companyId, String categoryCode);
}
