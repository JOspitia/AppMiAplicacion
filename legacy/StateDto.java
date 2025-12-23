package com.project.project.dto.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateDto {
    private UUID id;
    private String name;
    private String code;
    private UUID countryId;
}
