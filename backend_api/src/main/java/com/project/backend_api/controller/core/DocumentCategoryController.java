package com.project.backend_api.controller.core;

import com.project.backend_api.model.core.DocumentCategory;
import com.project.backend_api.service.core.DocumentCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/core/document-categories")
@RequiredArgsConstructor
public class DocumentCategoryController {

    private final DocumentCategoryService service;

    @GetMapping("/active")
    public ResponseEntity<List<DocumentCategory>> getActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping
    public ResponseEntity<List<DocumentCategory>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
