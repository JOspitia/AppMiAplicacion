package com.project.backend_api.service.core;

import com.project.backend_api.model.core.DocumentCategory;
import com.project.backend_api.repository.core.DocumentCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentCategoryService {

    private final DocumentCategoryRepository repository;
    private final AuthService authService;

    public List<DocumentCategory> getAllActive() {
        return repository.findAllByCompanyIdAndActiveTrueOrderByCodeAsc(authService.getSelectedCompanyId());
    }

    public List<DocumentCategory> getAll() {
        return repository.findAllByCompanyIdOrderByCodeAsc(authService.getSelectedCompanyId());
    }
}
