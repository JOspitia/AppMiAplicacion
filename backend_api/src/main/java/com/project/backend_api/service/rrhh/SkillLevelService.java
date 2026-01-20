package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.SkillLevelDto;
import com.project.backend_api.model.rrhh.SkillLevel;
import com.project.backend_api.repository.rrhh.SkillLevelRepository;
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
public class SkillLevelService {

    private final SkillLevelRepository skillLevelRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<SkillLevelDto> getAll() {
        return skillLevelRepository.findByCompanyIdOrderByWeight(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<SkillLevelDto> getActive() {
        return skillLevelRepository.findByCompanyIdAndActiveTrueOrderByWeight(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SkillLevelDto toDto(SkillLevel entity) {
        return SkillLevelDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .weight(entity.getWeight())
                .active(entity.getActive())
                .build();
    }
}
