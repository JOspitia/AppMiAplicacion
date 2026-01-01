package com.project.backend_api.dto.core.administration;



import lombok.Builder;
import java.util.UUID;

@Builder
public record ModuleSubscriptionDto(
        UUID id,
        String code,
        String name,
        String description,
        boolean isSubscribed) {
}



