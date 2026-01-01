package com.project.backend_api.service.core;

import com.project.backend_api.repository.core.administration.SidebarMenuRepository;
import com.project.backend_api.model.core.management.User;
import com.project.backend_api.model.core.management.UserCompanyRole;
import com.project.backend_api.model.core.administration.SidebarMenu;
import com.project.backend_api.dto.core.administration.ModuleDto;
import com.project.backend_api.repository.core.management.CompanySubscriptionRepository;
import com.project.backend_api.repository.core.management.UserCompanyRoleRepository;
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

    // Updated to handle multiple roles per user
    public List<ModuleDto> getUserModules(User user, UUID companyId) {
        // 1. Get company subscriptions
        Set<UUID> subscribedModuleIds = companySubscriptionRepository.findActiveByCompanyId(companyId)
                .stream()
                .map(cs -> cs.getModule().getId())
                .collect(Collectors.toSet());

        // 2. Get user role and permissions for this company
        Set<String> userPermissions = new HashSet<>();
        boolean isSuperAdmin = user.getIsSuperAdmin();
        boolean isCompanyAdmin = false;

        if (!isSuperAdmin) {
            List<UserCompanyRole> roles = userCompanyRoleRepository
                    .findByUserIdAndCompanyIdAndIsActiveTrue(user.getId(), companyId);

            for (UserCompanyRole ucr : roles) {
                if (ucr.getRole() != null && Boolean.TRUE.equals(ucr.getRole().getActive())) {
                    // Aggregate admin status
                    if (Boolean.TRUE.equals(ucr.getRole().getIsAdminRole())) {
                        isCompanyAdmin = true;
                    }
                    // Aggregate permissions
                    ucr.getRole().getPermissions().forEach(p -> userPermissions.add(p.getName()));
                }
            }
        }

        final boolean finalIsCompanyAdmin = isCompanyAdmin;

        // 3. Get all root menus and filter
        List<SidebarMenu> rootMenus = sidebarMenuRepository.findRootActive();

        return rootMenus.stream()
                .filter(m -> canAccess(m, subscribedModuleIds, userPermissions, isSuperAdmin, finalIsCompanyAdmin))
                .map(m -> mapToDto(m, subscribedModuleIds, userPermissions, isSuperAdmin, finalIsCompanyAdmin))
                .collect(Collectors.toList());
    }

    private boolean canAccess(SidebarMenu menu, Set<UUID> subscribedModuleIds, Set<String> userPermissions,
            boolean isSuperAdmin, boolean isCompanyAdmin) {
        // 1. ABSOLUTE PRIORITY: Super admins see everything active
        if (isSuperAdmin) {
            return true;
        }

        // 2. MODULE SUBSCRIPTION: Both Company Admins and Users are limited by what the
        // company has paid for
        if (menu.getModule() != null && !subscribedModuleIds.contains(menu.getModule().getId())) {
            return false;
        }

        // 3. COMPANY ADMIN PRIORITY: Sees all active menus if they belong to a
        // subscribed module
        if (isCompanyAdmin) {
            return true;
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
            boolean isSuperAdmin, boolean isCompanyAdmin) {
        List<ModuleDto> children = menu.getChildren().stream()
                .filter(child -> canAccess(child, subscribedModuleIds, userPermissions, isSuperAdmin, isCompanyAdmin))
                .map(child -> mapToDto(child, subscribedModuleIds, userPermissions, isSuperAdmin, isCompanyAdmin))
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
