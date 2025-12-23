package com.project.backend_api.repository;

import com.project.backend_api.model.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StateRepository extends JpaRepository<State, UUID> {
    List<State> findByCountryIdOrderByName(UUID countryId);
}
