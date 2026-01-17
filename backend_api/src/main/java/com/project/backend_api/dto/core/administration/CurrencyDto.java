package com.project.backend_api.dto.core.administration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyDto {
    private UUID id;
    private String code;
    private String name;
    private String symbol;
    private String nativeSymbol;
}
