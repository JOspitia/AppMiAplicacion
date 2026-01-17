package com.project.backend_api.controller.core.administration;

import com.project.backend_api.dto.core.administration.CurrencyDto;
import com.project.backend_api.model.core.administration.Currency;
import com.project.backend_api.repository.core.administration.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/core/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyRepository currencyRepository;

    @GetMapping
    public ResponseEntity<List<CurrencyDto>> getAll() {
        List<Currency> currencies = currencyRepository.findAll();
        return ResponseEntity.ok(currencies.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurrencyDto> getById(@PathVariable UUID id) {
        return currencyRepository.findById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private CurrencyDto toDto(Currency entity) {
        return CurrencyDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .symbol(entity.getSymbol())
                .nativeSymbol(entity.getNativeSymbol())
                .build();
    }
}
