package com.project.project.repository;

import com.project.project.model.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StateRepository extends JpaRepository<State, UUID> {
    List<State> findByCountryId(UUID countryId);

    List<State> findByCountryIdOrderByName(UUID countryId);

    List<State> findByCountryNameOrderByName(String countryName);

    Optional<State> findByNameAndCountryId(String name, UUID countryId);

    Optional<State> findByName(String name);
}
