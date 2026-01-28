package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {

    List<Relationship> findByActiveTrueOrderByDisplayOrderAsc();

    List<Relationship> findByIsFamilyAndActiveTrueOrderByDisplayOrderAsc(Boolean isFamily);

    Optional<Relationship> findByCode(String code);
}
