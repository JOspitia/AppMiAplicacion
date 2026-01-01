package com.project.backend_api.repository.core.administration;



import com.project.backend_api.model.core.administration.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GenderRepository extends JpaRepository<Gender, UUID> {
}






