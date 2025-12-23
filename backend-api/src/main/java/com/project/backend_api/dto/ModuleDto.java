package com.project.backend_api.dto;

import java.util.List;

public record ModuleDto(
                String id,
                String title,
                String url,
                String icon,
                String description,
                List<ModuleDto> children,
                Integer orderIndex) {
}
