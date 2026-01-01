package com.project.backend_api.dto.core.administration;



import lombok.Builder;
import java.util.UUID;

@Builder
public record SimpleOptionDto(
        UUID id,
        String name,
        String phoneCode) {
}





