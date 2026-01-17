package com.project.backend_api.service.core.management;

import com.project.backend_api.service.core.AuthService;
import com.project.backend_api.repository.core.management.RoleRepository;
import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.service.core.EmailService;
import com.project.backend_api.repository.core.administration.VerificationTokenRepository;
import com.project.backend_api.repository.core.administration.GlobalConfigurationRepository;
import com.project.backend_api.repository.core.management.UserRepository;

import com.project.backend_api.repository.core.management.UserCompanyRoleRepository;

import com.project.backend_api.dto.core.management.CreateUserRequest;
import com.project.backend_api.dto.core.administration.RegisterRequest;
import com.project.backend_api.dto.core.management.UserManagementDto;
import com.project.backend_api.model.core.management.User;
import com.project.backend_api.model.core.management.UserCompanyRole;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.Role;
import com.project.backend_api.model.core.administration.VerificationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final UserCompanyRoleRepository userCompanyRoleRepository;
        private final RoleRepository roleRepository;
        private final CompanyRepository companyRepository;
        private final VerificationTokenRepository verificationTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final EmailService emailService;
        private final GlobalConfigurationRepository globalConfigurationRepository;
        private final AuthService authService;

        @Value("${app.registration.default-company-name}")
        private String defaultCompanyName;

        @Value("${app.registration.default-role-name}")
        private String defaultRoleName;

        @Value("${app.base-url}")
        private String baseUrl;

        @Transactional
        public User registerUser(RegisterRequest request) {
                if (userRepository.findByUsername(request.username()).isPresent()) {
                        throw new RuntimeException("El nombre de usuario ya está en uso.");
                }
                if (userRepository.findByEmail(request.email()).isPresent()) {
                        throw new RuntimeException("El correo electrónico ya está en uso.");
                }

                String cleanedSecondSurname = (request.secondSurname() == null || request.secondSurname().isBlank())
                                ? null
                                : request.secondSurname();

                // Calculate password expiration
                int expirationDays = Integer
                                .parseInt(globalConfigurationRepository.findByVariableKey("PASSWORD_EXPIRATION_DAYS")
                                                .map(com.project.backend_api.model.core.administration.GlobalConfiguration::getVariableValue)
                                                .orElse("90"));
                LocalDateTime passwordExpiryDate = LocalDateTime.now().plusDays(expirationDays);

                User user = User.builder()
                                .username(request.username())
                                .email(request.email())
                                .firstName(request.firstName())
                                .firstSurname(request.firstSurname())
                                .secondSurname(cleanedSecondSurname)
                                .password(passwordEncoder.encode(request.password()))
                                .passwordExpiryDate(passwordExpiryDate)
                                .createdAt(LocalDateTime.now())
                                .isSuperAdmin(false)
                                .verified(false)
                                .build();

                final User savedUser = userRepository.save(user);

                // Link to PUBLIC company if exists
                companyRepository.findByName(defaultCompanyName).ifPresent(publicCompany -> {
                        roleRepository.findByNameAndCompanyId(defaultRoleName, publicCompany.getId())
                                        .ifPresent(role -> {
                                                UserCompanyRole ucr = UserCompanyRole.builder()
                                                                .user(savedUser)
                                                                .company(publicCompany)
                                                                .role(role)
                                                                .roleName(role.getName())
                                                                .isActive(true)
                                                                .build();
                                                userCompanyRoleRepository.save(ucr);
                                        });
                });

                // Generate Verification Token
                String token = UUID.randomUUID().toString();
                VerificationToken verificationToken = VerificationToken.builder()
                                .token(token)
                                .user(savedUser)
                                .expiryDate(LocalDateTime.now().plusHours(24))
                                .build();
                verificationTokenRepository.save(verificationToken);

                // Send Verification Email
                Map<String, String> emailVars = new HashMap<>();
                emailVars.put("userName", savedUser.getFirstName());
                emailVars.put("verificationLink", baseUrl + "/verify-email?token=" + token);
                emailService.sendTemplateEmail(savedUser.getEmail(), "EMAIL_VERIFICATION", emailVars);

                return savedUser;
        }

        public java.util.Optional<User> getUserByUsernameOrEmail(String identifier) {
                return userRepository.findByUsernameOrEmail(identifier);
        }

        public List<UserManagementDto> listUsersByCompany(UUID companyId) {
                return listUsersByCompany(companyId, false);
        }

        public List<UserManagementDto> listUsersByCompany(UUID companyId, boolean isSuperAdmin) {
                // Get all UserCompanyRoles for the company
                List<UserCompanyRole> allRoles = userCompanyRoleRepository.findByCompanyId(companyId)
                                .stream()
                                .filter(ucr -> isSuperAdmin || (!Boolean.TRUE.equals(ucr.getUser().getIsSuperAdmin()) &&
                                                !Boolean.TRUE.equals(ucr.getUser().getIsRoot()) &&
                                                (ucr.getRole() == null || !Boolean.TRUE
                                                                .equals(ucr.getRole().getIsRootRole()))))
                                .collect(Collectors.toList());

                // Group by user and select the most recent UserCompanyRole for each user
                Map<UUID, UserCompanyRole> latestUserRoles = allRoles.stream()
                                .collect(Collectors.toMap(
                                                ucr -> ucr.getUser().getId(),
                                                ucr -> ucr,
                                                (existing, replacement) -> {
                                                        // Keep the most recent one (by createdAt)
                                                        if (replacement.getCreatedAt() != null
                                                                        && existing.getCreatedAt() != null) {
                                                                return replacement.getCreatedAt()
                                                                                .isAfter(existing.getCreatedAt())
                                                                                                ? replacement
                                                                                                : existing;
                                                        }
                                                        return existing;
                                                }));

                // Convert to DTOs, but aggregate ALL roles for each user
                return latestUserRoles.values().stream()
                                .map(primaryUcr -> {
                                        // Get all roles for this user (for the roleNames/roleIds fields)
                                        List<UserCompanyRole> userRoles = allRoles.stream()
                                                        .filter(ucr -> ucr.getUser().getId()
                                                                        .equals(primaryUcr.getUser().getId()))
                                                        .collect(Collectors.toList());
                                        return convertToManagementDto(primaryUcr, userRoles);
                                })
                                .collect(Collectors.toList());
        }

        @Transactional
        public void toggleActive(UUID userCompanyRoleId) {
                UserCompanyRole ucr = userCompanyRoleRepository.findById(userCompanyRoleId)
                                .orElseThrow(() -> new RuntimeException("Asociación de usuario no encontrada"));

                boolean newState = !ucr.getIsActive();
                ucr.setIsActive(newState);
                userCompanyRoleRepository.save(ucr);

                // Hierarchy Logic: If inactivated in a real company, check if we need to
                // reactivate PUBLIC
                if (!newState && !ucr.getCompany().getName().equalsIgnoreCase("PUBLIC")) {
                        checkAndReactivatePublicAccess(ucr.getUser());
                } else if (newState && !ucr.getCompany().getName().equalsIgnoreCase("PUBLIC")) {
                        // If activated in a real company, we disable PUBLIC to keep it isolated
                        disablePublicAccess(ucr.getUser());
                }
        }

        @Transactional
        public UserManagementDto createUser(CreateUserRequest request, UUID creatorCompanyId) {
                var company = companyRepository.findById(creatorCompanyId)
                                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

                // 1. Check if user already exists globally
                var existingUser = userRepository.findByUsernameOrEmail(request.username())
                                .or(() -> userRepository.findByEmail(request.email()));

                if (existingUser.isPresent()) {
                        User user = existingUser.get();

                        // Check if already linked to this company
                        boolean alreadyLinked = userCompanyRoleRepository.findByCompanyId(creatorCompanyId)
                                        .stream().anyMatch(ucr -> ucr.getUser().getId().equals(user.getId()));

                        if (alreadyLinked) {
                                throw new RuntimeException("El usuario ya está registrado en esta empresa.");
                        }

                        // If NOT forced, we throw a Conflict asking for confirmation (409 logic)
                        if (!Boolean.TRUE.equals(request.forceLink())) {
                                // We use a special message prefix so the frontend knows it's a "Link" situation
                                throw new RuntimeException("USER_EXISTS_GLOBAL:" + user.getFirstName() + " "
                                                + user.getFirstSurname());
                        }

                        // Force linking: Just add the roles and isolated the user
                        return linkExistingUser(user, company, request);
                }

                // 2. New User Creation
                // Generate a simple random password
                String rawPassword = UUID.randomUUID().toString().substring(0, 8);

                String cleanedSecondSurname = (request.secondSurname() == null || request.secondSurname().isBlank())
                                ? null
                                : request.secondSurname();

                // Calculate password expiration
                int expirationDays = Integer
                                .parseInt(globalConfigurationRepository.findByVariableKey("PASSWORD_EXPIRATION_DAYS")
                                                .map(com.project.backend_api.model.core.administration.GlobalConfiguration::getVariableValue)
                                                .orElse("90"));
                LocalDateTime passwordExpiryDate = LocalDateTime.now().plusDays(expirationDays);

                User user = User.builder()
                                .username(request.username())
                                .email(request.email())
                                .firstName(request.firstName())
                                .firstSurname(request.firstSurname())
                                .secondSurname(cleanedSecondSurname)
                                .password(passwordEncoder.encode(rawPassword))
                                .passwordExpiryDate(passwordExpiryDate)
                                .requirePasswordChange(true)
                                .createdAt(LocalDateTime.now())
                                .isSuperAdmin(false)
                                .verified(false)
                                .build();

                user = userRepository.save(user);

                // Assign Roles (or default)
                // Security Check: Non-ROOT users cannot assign ROOT role
                if (request.roleIds() != null) {
                        for (UUID rId : request.roleIds()) {
                                roleRepository.findById(rId).ifPresent(r -> {
                                        boolean isRequesterPrivileged = Boolean.TRUE
                                                        .equals(authService.getCurrentUser().getIsSuperAdmin()) ||
                                                        Boolean.TRUE.equals(authService.getCurrentUser().getIsRoot());
                                        if (Boolean.TRUE.equals(r.getIsRootRole()) && !isRequesterPrivileged) {
                                                throw new RuntimeException(
                                                                "No tiene permisos para asignar el rol ROOT");
                                        }
                                });
                        }
                }
                List<UserCompanyRole> userCompanyRoles = assignRolesToUserInCompany(user, company, request.roleIds(),
                                request.active());

                // Isolation: Disable PUBLIC if moving to a real company
                if (!company.getName().equalsIgnoreCase("PUBLIC")) {
                        disablePublicAccess(user);
                }

                // Generate Verification Token
                String token = UUID.randomUUID().toString();
                VerificationToken verificationToken = VerificationToken.builder()
                                .token(token)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(24))
                                .build();
                verificationTokenRepository.save(verificationToken);

                // Send Email with credentials
                Map<String, String> emailVars = new HashMap<>();
                emailVars.put("firstName", user.getFirstName());
                emailVars.put("username", user.getUsername());
                emailVars.put("password", rawPassword);
                emailVars.put("companyName", company.getName());
                emailVars.put("activationLink", baseUrl + "/verify-email?token=" + token);
                emailVars.put("loginLink", baseUrl + "/login");

                emailService.sendTemplateEmail(user.getEmail(), "USER_ACCOUNT_CREATED", emailVars);

                return convertToManagementDto(userCompanyRoles);
        }

        private UserManagementDto linkExistingUser(User user, Company company, CreateUserRequest request) {
                // Link roles
                List<UserCompanyRole> linkedRoles = assignRolesToUserInCompany(user, company, request.roleIds(),
                                request.active());

                // Isolate
                if (!company.getName().equalsIgnoreCase("PUBLIC")) {
                        disablePublicAccess(user);
                }

                return convertToManagementDto(linkedRoles);
        }

        private List<UserCompanyRole> assignRolesToUserInCompany(User user, Company company, List<UUID> roleIds,
                        Boolean active) {
                List<UserCompanyRole> createdRoles = new java.util.ArrayList<>();
                boolean isActive = active != null ? active : true;

                if (roleIds == null || roleIds.isEmpty()) {
                        // Assign default role: NUEVO_EMPLEADO
                        Role defaultRole = getOrCreateDefaultEmployeeRole(company);
                        UserCompanyRole ucr = UserCompanyRole.builder()
                                        .user(user)
                                        .company(company)
                                        .role(defaultRole)
                                        .roleName(defaultRole.getName())
                                        .isActive(isActive)
                                        .build();
                        createdRoles.add(userCompanyRoleRepository.save(ucr));
                } else {
                        for (UUID roleId : roleIds) {
                                var role = roleRepository.findById(roleId)
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Rol no encontrado: " + roleId));

                                UserCompanyRole ucr = UserCompanyRole.builder()
                                                .user(user)
                                                .company(company)
                                                .role(role)
                                                .roleName(role.getName())
                                                .isActive(isActive)
                                                .build();
                                createdRoles.add(userCompanyRoleRepository.save(ucr));
                        }
                }
                return createdRoles;
        }

        private Role getOrCreateDefaultEmployeeRole(Company company) {
                return roleRepository.findByNameAndCompanyId("NUEVO_EMPLEADO", company.getId())
                                .orElseGet(() -> {
                                        Role newRole = Role.builder()
                                                        .name("NUEVO_EMPLEADO")
                                                        .description("Rol asignado automáticamente a nuevos integrantes")
                                                        .company(company)
                                                        .isSystemRole(true)
                                                        .active(true)
                                                        .createdAt(LocalDateTime.now())
                                                        .build();
                                        return roleRepository.save(newRole);
                                });
        }

        private void disablePublicAccess(User user) {
                companyRepository.findByName("PUBLIC").ifPresent(publicCompany -> {
                        userCompanyRoleRepository.findByUserId(user.getId()).stream()
                                        .filter(ucr -> ucr.getCompany().getId().equals(publicCompany.getId()))
                                        .forEach(ucr -> {
                                                ucr.setIsActive(false);
                                                userCompanyRoleRepository.save(ucr);
                                        });
                });
        }

        private void checkAndReactivatePublicAccess(User user) {
                // Count active "Real" companies
                long activeRealCompanies = userCompanyRoleRepository.findByUserId(user.getId()).stream()
                                .filter(ucr -> !ucr.getCompany().getName().equalsIgnoreCase("PUBLIC"))
                                .filter(UserCompanyRole::getIsActive)
                                .count();

                // If no more real jobs, give back the PUBLIC access
                if (activeRealCompanies == 0) {
                        companyRepository.findByName("PUBLIC").ifPresent(publicCompany -> {
                                var publicAssociations = userCompanyRoleRepository.findByUserId(user.getId()).stream()
                                                .filter(ucr -> ucr.getCompany().getId().equals(publicCompany.getId()))
                                                .toList();

                                if (publicAssociations.isEmpty()) {
                                        // Create it if it doesn't exist
                                        Role defaultRole = roleRepository
                                                        .findByNameAndCompanyId(defaultRoleName, publicCompany.getId())
                                                        .orElse(null);

                                        UserCompanyRole ucr = UserCompanyRole.builder()
                                                        .user(user)
                                                        .company(publicCompany)
                                                        .role(defaultRole)
                                                        .roleName(defaultRole != null ? defaultRole.getName()
                                                                        : defaultRoleName)
                                                        .isActive(true)
                                                        .build();
                                        userCompanyRoleRepository.save(ucr);
                                } else {
                                        // Reactivate all existing ones
                                        publicAssociations.forEach(ucr -> {
                                                ucr.setIsActive(true);
                                                userCompanyRoleRepository.save(ucr);
                                        });
                                }
                        });
                }
        }

        public UserManagementDto getUserManagementById(UUID userCompanyRoleId) {
                UserCompanyRole ucr = userCompanyRoleRepository.findById(userCompanyRoleId)
                                .orElseThrow(() -> new RuntimeException("Asociación de usuario no encontrada"));

                // Fetch all roles for this user in the same company
                List<UserCompanyRole> allRoles = userCompanyRoleRepository.findByCompanyId(ucr.getCompany().getId())
                                .stream()
                                .filter(r -> r.getUser().getId().equals(ucr.getUser().getId()))
                                .collect(Collectors.toList());

                return convertToManagementDto(allRoles);
        }

        @Transactional
        public void verifyEmail(String token) {
                VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                                .orElseThrow(() -> new RuntimeException("Token de verificación inválido."));

                if (verificationToken.isExpired()) {
                        throw new RuntimeException("El token de verificación ha expirado.");
                }

                User user = verificationToken.getUser();
                user.setVerified(true);
                userRepository.save(user);

                verificationTokenRepository.delete(verificationToken);
        }

        @Transactional
        public void resendVerificationEmail(String emailOrUsername) {
                User user = userRepository.findByUsernameOrEmail(emailOrUsername)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

                if (user.getVerified()) {
                        throw new RuntimeException("La cuenta ya está verificada.");
                }

                VerificationToken token = verificationTokenRepository.findByUser_Id(user.getId())
                                .orElse(null);

                if (token == null || token.isExpired()) {
                        if (token != null) {
                                verificationTokenRepository.delete(token);
                        }
                        token = VerificationToken.builder()
                                        .token(UUID.randomUUID().toString())
                                        .user(user)
                                        .expiryDate(LocalDateTime.now().plusHours(24))
                                        .build();
                        token = verificationTokenRepository.save(token);
                }

                Map<String, String> emailVars = new HashMap<>();
                emailVars.put("userName", user.getFirstName());
                emailVars.put("verificationLink", baseUrl + "/verify-email?token=" + token.getToken());
                emailService.sendTemplateEmail(user.getEmail(), "EMAIL_VERIFICATION", emailVars);
        }

        private UserManagementDto convertToManagementDto(List<UserCompanyRole> userCompanyRoles) {
                if (userCompanyRoles == null || userCompanyRoles.isEmpty()) {
                        throw new RuntimeException("No se encontraron roles para el usuario");
                }

                UserCompanyRole primary = userCompanyRoles.get(0);
                return convertToManagementDto(primary, userCompanyRoles);
        }

        private UserManagementDto convertToManagementDto(UserCompanyRole primary, List<UserCompanyRole> allUserRoles) {
                User user = primary.getUser();

                List<String> roleNames = allUserRoles.stream()
                                .filter(ucr -> Boolean.TRUE.equals(ucr.getIsActive()) && (ucr.getRole() == null
                                                || Boolean.TRUE.equals(ucr.getRole().getActive())))
                                .map(ucr -> ucr.getRole() != null ? ucr.getRole().getName() : ucr.getRoleName())
                                .collect(Collectors.toList());

                List<UUID> roleIds = allUserRoles.stream()
                                .filter(ucr -> Boolean.TRUE.equals(ucr.getIsActive()) && (ucr.getRole() == null
                                                || Boolean.TRUE.equals(ucr.getRole().getActive())))
                                .map(ucr -> ucr.getRole() != null ? ucr.getRole().getId() : null)
                                .filter(java.util.Objects::nonNull)
                                .collect(Collectors.toList());

                return UserManagementDto.builder()
                                .id(primary.getId())
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .firstName(user.getFirstName())
                                .firstSurname(user.getFirstSurname())
                                .secondSurname(user.getSecondSurname())
                                .roleNames(roleNames)
                                .roleIds(roleIds)
                                .verified(user.getVerified())
                                .active(primary.getIsActive())
                                .createdAt(primary.getCreatedAt())
                                .build();
        }

        @Transactional
        public void assignRoleToUser(UUID userId, UUID companyId, UUID roleId) {
                var user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                var company = companyRepository.findById(companyId)
                                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

                var role = roleRepository.findById(roleId)
                                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

                // Check if the user already has this role in this company
                boolean exists = userCompanyRoleRepository.findByCompanyId(companyId).stream()
                                .anyMatch(ucr -> ucr.getUser().getId().equals(userId)
                                                && ucr.getRole() != null
                                                && ucr.getRole().getId().equals(roleId));

                if (exists) {
                        throw new RuntimeException("El usuario ya tiene este rol asignado");
                }

                UserCompanyRole ucr = UserCompanyRole.builder()
                                .user(user)
                                .company(company)
                                .role(role)
                                .roleName(role.getName())
                                .isActive(true)
                                .build();

                userCompanyRoleRepository.save(ucr);
        }

        @Transactional
        public void removeRoleFromUser(UUID userId, UUID companyId, UUID roleId) {
                // Find the specific UserCompanyRole entry
                UserCompanyRole ucr = userCompanyRoleRepository.findByCompanyId(companyId).stream()
                                .filter(r -> r.getUser().getId().equals(userId)
                                                && r.getRole() != null
                                                && r.getRole().getId().equals(roleId))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Asignación de rol no encontrada"));

                // Ensure user has at least one other role before removing
                long roleCount = userCompanyRoleRepository.findByCompanyId(companyId).stream()
                                .filter(r -> r.getUser().getId().equals(userId))
                                .count();

                if (roleCount <= 1) {
                        throw new RuntimeException("No se puede eliminar el último rol del usuario");
                }

                userCompanyRoleRepository.delete(ucr);
        }

        @Transactional
        public UserManagementDto updateUserRoles(UUID userId, UUID companyId, List<UUID> roleIds) {
                var user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                var company = companyRepository.findById(companyId)
                                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

                // Get current roles
                List<UserCompanyRole> currentRoles = userCompanyRoleRepository.findByCompanyId(companyId).stream()
                                .filter(ucr -> ucr.getUser().getId().equals(userId))
                                .collect(Collectors.toList());

                java.util.Set<UUID> currentRoleIds = currentRoles.stream()
                                .map(ucr -> ucr.getRole().getId())
                                .collect(Collectors.toSet());

                java.util.Set<UUID> newRoleIds = new java.util.HashSet<>(roleIds);

                // Roles to delete (present in current but not in new)
                List<UserCompanyRole> toDelete = currentRoles.stream()
                                .filter(ucr -> !newRoleIds.contains(ucr.getRole().getId()))
                                .collect(Collectors.toList());

                if (!toDelete.isEmpty()) {
                        userCompanyRoleRepository.deleteAll(toDelete);
                }

                // Prepare return list with roles that persist
                List<UserCompanyRole> finalRoles = new java.util.ArrayList<>(currentRoles);
                finalRoles.removeAll(toDelete);

                // Roles to add (present in new but not in current)
                boolean isRequesterSuperAdmin = authService.getCurrentUser().getIsSuperAdmin();
                for (UUID roleId : newRoleIds) {
                        if (!currentRoleIds.contains(roleId)) {
                                var role = roleRepository.findById(roleId)
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Rol no encontrado: " + roleId));

                                boolean isRequesterPrivileged = Boolean.TRUE.equals(isRequesterSuperAdmin) ||
                                                Boolean.TRUE.equals(authService.getCurrentUser().getIsRoot());
                                if (Boolean.TRUE.equals(role.getIsRootRole()) && !isRequesterPrivileged) {
                                        throw new RuntimeException("No tiene permisos para asignar el rol ROOT");
                                }

                                UserCompanyRole ucr = UserCompanyRole.builder()
                                                .user(user)
                                                .company(company)
                                                .role(role)
                                                .roleName(role.getName())
                                                .isActive(true)
                                                .build();

                                finalRoles.add(userCompanyRoleRepository.save(ucr));
                        }
                }

                return convertToManagementDto(finalRoles);
        }
}
