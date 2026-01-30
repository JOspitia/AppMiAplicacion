package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {
    List<EmployeeDocument> findByEmployeeId(UUID employeeId);

    void deleteByEmployeeIdAndIsUnified(UUID employeeId, Boolean isUnified);

    void deleteByEmployeeIdAndDocumentTypeId(UUID employeeId, UUID documentTypeId);
}
