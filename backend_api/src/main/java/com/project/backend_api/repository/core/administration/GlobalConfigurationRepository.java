package com.project.backend_api.repository.core.administration;

import com.project.backend_api.model.core.administration.GlobalConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GlobalConfigurationRepository extends JpaRepository<GlobalConfiguration, UUID> {
    Optional<GlobalConfiguration> findByVariableKey(String variableKey);
}
