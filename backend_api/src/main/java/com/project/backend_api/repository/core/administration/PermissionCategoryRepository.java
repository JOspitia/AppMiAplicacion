package com.project.backend_api.repository.core.administration;



import com.project.backend_api.model.core.administration.PermissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface PermissionCategoryRepository extends JpaRepository<PermissionCategory, UUID> {
    List<PermissionCategory> findByActiveTrueOrderByOrderIndexAsc();

    List<PermissionCategory> findByModuleIdOrderByOrderIndexAsc(UUID moduleId);
}






