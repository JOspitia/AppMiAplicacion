package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.ContractType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractTypeRepository extends JpaRepository<ContractType, UUID> {
    List<ContractType> findByCompanyId(UUID companyId);

    List<ContractType> findByCompanyIdAndActiveTrue(UUID companyId);

    boolean existsByCompanyIdAndNameAndIdNot(UUID companyId, String name, UUID id);

    boolean existsByCompanyIdAndName(UUID companyId, String name);
}
