package com.project.backend_api.service;

import com.project.backend_api.dto.ModuleDto;
import com.project.backend_api.model.*;
import com.project.backend_api.repository.CompanySubscriptionRepository;
import com.project.backend_api.repository.SidebarMenuRepository;
import com.project.backend_api.repository.UserCompanyRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {

    private final SidebarMenuRepository sidebarMenuRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final UserCompanyRoleRepository userCompanyRoleRepository;

    public List<ModuleDto> getUserModules(User user, UUID companyId) {
        // 1. Get company subscriptions
        Set<UUID> subscribedModuleIds = companySubscriptionRepository.findActiveByCompanyId(companyId)
                .stream()
                .map(cs -> cs.getModule().getId())
                .collect(Collectors.toSet());

        // 2. Get user role and permissions for this company
        Set<String> userPermissions = new HashSet<>();
        boolean isSuperAdmin = user.getIsSuperAdmin();

        if (!isSuperAdmin) {
            userCompanyRoleRepository.findByUserIdAndCompanyIdAndIsActiveTrue(user.getId(), companyId)
                    .ifPresent(ucr -> {
                        if (ucr.getRole() != null) {
                            ucr.getRole().getPermissions().forEach(p -> userPermissions.add(p.getName()));
                        }
                    });
        }

        // 3. Get all root menus and filter
        List<SidebarMenu> rootMenus = sidebarMenuRepository.findRootActive();

        return rootMenus.stream()
                .filter(m -> canAccess(m, subscribedModuleIds, userPermissions, isSuperAdmin))
                .map(m -> mapToDto(m, subscribedModuleIds, userPermissions, isSuperAdmin))
                .collect(Collectors.toList());
    }

    private boolean canAccess(SidebarMenu menu, Set<UUID> subscribedModuleIds, Set<String> userPermissions,
            boolean isSuperAdmin) {
        // Super admins see everything active
        if (isSuperAdmin)
            return true;

        // If it requires a module, check subscription
        if (menu.getModule() != null && !subscribedModuleIds.contains(menu.getModule().getId())) {
            return false;
        }

        // If it requires a permission, check it
        String requiredPermission = menu.getPermissionRequired();
        if (requiredPermission != null && !requiredPermission.trim().isEmpty()) {
            if (!userPermissions.contains(requiredPermission)) {
                return false;
            }
        }

        return true;
    }

    private ModuleDto mapToDto(SidebarMenu menu, Set<UUID> subscribedModuleIds, Set<String> userPermissions,
            boolean isSuperAdmin) {
        List<ModuleDto> children = menu.getChildren().stream()
                .filter(child -> canAccess(child, subscribedModuleIds, userPermissions, isSuperAdmin))
                .map(child -> mapToDto(child, subscribedModuleIds, userPermissions, isSuperAdmin))
                .collect(Collectors.toList());

        return new ModuleDto(
                menu.getId().toString(),
                menu.getTitle(),
                menu.getUrl(),
                menu.getIcon(),
                menu.getModule() != null ? menu.getModule().getDescription() : null,
                children,
                menu.getOrderIndex());
    }
}
