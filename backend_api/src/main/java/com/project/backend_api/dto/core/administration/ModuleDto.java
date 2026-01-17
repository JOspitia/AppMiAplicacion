package com.project.backend_api.dto.core.administration;

import java.util.List;

public record ModuleDto(
        String id,
        String code,
        String title,
        String url,
        String icon,
        String description,
        List<ModuleDto> children,
        Integer orderIndex) {
}
