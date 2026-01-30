package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.DocumentTypeDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.DocumentType;
import com.project.backend_api.repository.core.DocumentCategoryRepository;
import com.project.backend_api.repository.rrhh.DocumentTypeRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentTypeService {

    private final DocumentTypeRepository repository;
    private final DocumentCategoryRepository categoryRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<DocumentTypeDto> getAll() {
        return repository.findByCompanyIdOrderByNameAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<DocumentTypeDto> getActive() {
        return repository.findByCompanyIdAndActiveTrueOrderByNameAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DocumentTypeDto getById(UUID id) {
        DocumentType entity = findByIdAndValidateAccess(id);
        return toDto(entity);
    }

    @Transactional
    public DocumentTypeDto create(DocumentTypeDto dto) {
        UUID companyId = getCurrentCompanyId();
        DocumentType entity = new DocumentType();
        entity.setCompany(Company.builder().id(companyId).build());

        updateEntityFromDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public DocumentTypeDto update(UUID id, DocumentTypeDto dto) {
        DocumentType entity = findByIdAndValidateAccess(id);
        updateEntityFromDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public void toggleActive(UUID id) {
        DocumentType entity = findByIdAndValidateAccess(id);
        entity.setActive(!entity.getActive());
        repository.save(entity);
    }

    @Transactional
    public void delete(UUID id) {
        DocumentType entity = findByIdAndValidateAccess(id);
        repository.delete(entity);
    }

    private DocumentType findByIdAndValidateAccess(UUID id) {
        DocumentType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No autorizado");
        }
        return entity;
    }

    private void updateEntityFromDto(DocumentType entity, DocumentTypeDto dto) {
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        entity.setIsRequired(dto.getIsRequired());
        entity.setRequiresExpiration(dto.getRequiresExpiration());
        entity.setActive(dto.getActive());

        // Asignación automática de categoría 'RRHH'
        categoryRepository.findByCodeAndCompanyId("RRHH_DOCUMENT", getCurrentCompanyId())
                .ifPresent(entity::setCategory);
    }

    private DocumentTypeDto toDto(DocumentType entity) {
        return DocumentTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .isRequired(entity.getIsRequired())
                .requiresExpiration(entity.getRequiresExpiration())
                .active(entity.getActive())
                .build();
    }
}
