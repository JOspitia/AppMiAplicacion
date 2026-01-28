package com.project.backend_api.controller.core.administration;

import com.project.backend_api.model.core.administration.Gender;
import com.project.backend_api.repository.core.administration.GenderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/core/administration/genders")
@RequiredArgsConstructor
public class GenderController {
    private final GenderRepository genderRepository;

    @GetMapping
    public List<Gender> getAll() {
        return genderRepository.findAll();
    }
}
