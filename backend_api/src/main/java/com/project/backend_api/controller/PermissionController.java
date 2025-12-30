package com.project.backend_api.controller;

import com.project.backend_api.dto.PermissionDto;
import com.project.backend_api.model.Permission;
import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/management/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * Obtiene el catálogo de permisos disponibles para la empresa.
     * * @param grouped Si es true (por defecto), devuelve un Map agrupado por
     * Módulo.
     * Si es false, devuelve una lista plana.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('CORE_ROLE_VIEW') or hasAuthority('ROLE_ROOT')")
    public ResponseEntity<?> getPermissions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "true") boolean grouped) {

        // 1. Obtener permisos válidos según la suscripción de la empresa
        // (Esto ya filtra módulos que la empresa no ha pagado)
        List<Permission> permissions = permissionService.getActivePermissions(userDetails.getCompanyId());

        // 2. Convertir a DTOs
        List<PermissionDto> permissionDtos = permissions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // 3. Retornar según formato solicitado
        if (grouped) {
            // Agrupar por nombre del Módulo usando un TreeMap para que las llaves (Módulos)
            // salgan ordenadas alfabéticamente
            Map<String, List<PermissionDto>> permissionsByModule = permissionDtos.stream()
                    .collect(Collectors.groupingBy(
                            PermissionDto::getModuleName,
                            () -> new TreeMap<>(Comparator.naturalOrder()),
                            Collectors.toList()));
            return ResponseEntity.ok(permissionsByModule);
        } else {
            return ResponseEntity.ok(permissionDtos);
        }
    }

    private PermissionDto convertToDto(Permission p) {
        return PermissionDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .moduleName(p.getModule() != null ? p.getModule().getName() : "General")
                .resourceName(extractResourceName(p.getName()))
                .category(p.getCategory())
                .build();
    }

    /**
     * Extrae un nombre amigable del recurso basado en la nomenclatura del permiso.
     * Ej: CORE_USER_CREATE -> User
     */
    private String extractResourceName(String permissionCode) {
        if (permissionCode == null || !permissionCode.contains("_")) {
            return "General";
        }
        // Asumiendo formato MODULO_RECURSO_ACCION (ej: CRM_CUSTOMER_CREATE)
        String[] parts = permissionCode.split("_");
        if (parts.length >= 2) {
            // Retorna la segunda parte como recurso, capitalizada
            String resource = parts[1];
            return resource.substring(0, 1).toUpperCase() + resource.substring(1).toLowerCase();
        }
        return "General";
    }
}