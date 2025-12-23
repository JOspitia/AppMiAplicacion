package com.project.backend_api.dto;

import lombok.Builder;
import java.util.UUID;

@Builder
public record SimpleOptionDto(
        UUID id,
        String name,
        String phoneCode) {
}
