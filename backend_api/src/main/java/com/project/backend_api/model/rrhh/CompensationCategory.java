package com.project.backend_api.model.rrhh;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CompensationCategory {
    EARNING("Ingreso", "Suma al neto a pagar", "bg-emerald-100 text-emerald-700 border-emerald-200"),
    DEDUCTION("Deducción", "Resta del neto a pagar", "bg-rose-100 text-rose-700 border-rose-200");

    private final String label;
    private final String description;
    private final String cssBadge;
}
