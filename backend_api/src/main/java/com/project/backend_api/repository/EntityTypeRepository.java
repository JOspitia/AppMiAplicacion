package com.project.backend_api.repository;

import com.project.backend_api.model.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityTypeRepository extends JpaRepository<EntityType, UUID> {
    List<EntityType> findByActiveTrue();
}
