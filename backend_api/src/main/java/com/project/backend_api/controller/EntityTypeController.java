package com.project.backend_api.controller;

import com.project.backend_api.dto.EntityTypeDTO;
import com.project.backend_api.model.EntityType;
import com.project.backend_api.repository.EntityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configuration/entity-types")
@RequiredArgsConstructor
public class EntityTypeController {

    private final EntityTypeRepository entityTypeRepository;

    @GetMapping
    public ResponseEntity<List<EntityTypeDTO>> listActive() {
        List<EntityTypeDTO> dtos = entityTypeRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private EntityTypeDTO toDto(EntityType entity) {
        return EntityTypeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .active(entity.getActive())
                .build();
    }
}
