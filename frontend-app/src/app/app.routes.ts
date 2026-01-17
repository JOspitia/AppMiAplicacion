import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public/public-layout/public-layout';
import { LandingComponent } from './landing';
import { TermsComponent } from './public/terms.component';
import { PrivacyComponent } from './public/privacy.component';
import { CookiesComponent } from './public/cookies.component';
import { SecurityInfoComponent } from './public/security-info.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register';
import { VerifyEmailComponent } from './auth/verify-email';
import { SelectCompanyComponent } from './auth/select-company/select-company.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { HomeComponent } from './core/home/home.component';
import { superAdminGuard, authGuard, guestGuard, rootGuard } from './core/guards/auth.guard';
import { CompanyListComponent } from './core/companies/company-list.component';
import { CompanyFormComponent } from './core/companies/company-form.component';
import { UserListComponent } from './core/management/users/user-list.component';
import { UserFormComponent } from './core/management/users/user-form.component';


export const routes: Routes = [
    // 1. Auth Routes (No Layout)
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'verify-email', component: VerifyEmailComponent, canActivate: [guestGuard] },
    { path: 'select-company', component: SelectCompanyComponent },

    // 2. Public Website (PublicLayout) - MOVED UP
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: LandingComponent, pathMatch: 'full', canActivate: [guestGuard] },
            { path: 'terms', component: TermsComponent },
            { path: 'privacy', component: PrivacyComponent },
            { path: 'cookies', component: CookiesComponent },
            { path: 'security', component: SecurityInfoComponent }
        ]
    },

    // 3. Internal Application (MainLayout + Auth Guard)
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'core/management/users', component: UserListComponent },
            { path: 'core/management/users/create', component: UserFormComponent },
            { path: 'core/management/users/edit/:id', component: UserFormComponent },
            { path: 'core/management/users/profile', loadComponent: () => import('./core/management/users/profile/profile').then(m => m.ProfileComponent) },
            { path: 'core/management/users/profile/change-password', loadComponent: () => import('./core/management/users/profile/change-password.component').then(m => m.ChangePasswordComponent) },
            { path: 'core/management/roles', loadComponent: () => import('./core/management/roles/role-list.component').then(m => m.RoleListComponent) },
            { path: 'core/management/roles/create', loadComponent: () => import('./core/management/roles/role-form.component').then(m => m.RoleFormComponent) },
            { path: 'core/management/roles/edit/:id', loadComponent: () => import('./core/management/roles/role-form.component').then(m => m.RoleFormComponent) },
            { path: 'core/management/companies', component: CompanyListComponent },
            { path: 'core/management/companies/create', component: CompanyFormComponent },
            { path: 'core/management/companies/edit/:id', component: CompanyFormComponent },
            { path: 'core/management/companies/:id/subscriptions', loadComponent: () => import('./core/companies/company-subscription.component').then(m => m.CompanySubscriptionComponent), canActivate: [superAdminGuard] },

            // Ubicaciones (Geografía - Sync)
            { path: 'core/management/locations', loadComponent: () => import('./core/management/geo/geo-sync.component').then(m => m.GeoSyncComponent), canActivate: [rootGuard] },

            // Catálogo de Permisos
            { path: 'core/permissions/catalog', loadComponent: () => import('./core/management/permissions/permission-catalog.component').then(m => m.PermissionCatalogComponent) },

            // Sedes (RRHH - Gestión física)
            { path: 'rrhh/sedes', loadComponent: () => import('./rrhh/locations/location-list.component').then(m => m.LocationListComponent) },
            { path: 'rrhh/sedes/create', loadComponent: () => import('./rrhh/locations/location-form.component').then(m => m.LocationFormComponent) },
            { path: 'rrhh/sedes/edit/:id', loadComponent: () => import('./rrhh/locations/location-form.component').then(m => m.LocationFormComponent) },

            // Centros Operacionales
            { path: 'rrhh/operational-centers', loadComponent: () => import('./rrhh/operational-centers/op-center-list.component').then(m => m.OperationalCenterListComponent) },
            { path: 'rrhh/operational-centers/create', loadComponent: () => import('./rrhh/operational-centers/op-center-form.component').then(m => m.OperationalCenterFormComponent) },
            { path: 'rrhh/operational-centers/edit/:id', loadComponent: () => import('./rrhh/operational-centers/op-center-form.component').then(m => m.OperationalCenterFormComponent) },

            // Centros de Costos
            { path: 'rrhh/cost-centers', loadComponent: () => import('./rrhh/cost-centers/cost-center-list.component').then(m => m.CostCenterListComponent) },
            { path: 'rrhh/cost-centers/new', loadComponent: () => import('./rrhh/cost-centers/cost-center-form.component').then(m => m.CostCenterFormComponent) },
            { path: 'rrhh/cost-centers/edit/:id', loadComponent: () => import('./rrhh/cost-centers/cost-center-form.component').then(m => m.CostCenterFormComponent) },

            // Niveles Organizacionales
            { path: 'rrhh/organizational-levels', loadComponent: () => import('./rrhh/organizational-levels/org-level-list.component').then(m => m.OrganizationalLevelListComponent) },
            { path: 'rrhh/organizational-levels/create', loadComponent: () => import('./rrhh/organizational-levels/org-level-form.component').then(m => m.OrganizationalLevelFormComponent) },
            { path: 'rrhh/organizational-levels/edit/:id', loadComponent: () => import('./rrhh/organizational-levels/org-level-form.component').then(m => m.OrganizationalLevelFormComponent) },

            // Departamentos
            { path: 'rrhh/departments', loadComponent: () => import('./rrhh/departments/department-list.component').then(m => m.DepartmentListComponent) },
            { path: 'rrhh/departments/create', loadComponent: () => import('./rrhh/departments/department-form.component').then(m => m.DepartmentFormComponent) },
            { path: 'rrhh/departments/edit/:id', loadComponent: () => import('./rrhh/departments/department-form.component').then(m => m.DepartmentFormComponent) },

            { path: 'dashboard', component: DashboardComponent, canActivate: [superAdminGuard] }
        ]
    },

    // 4. Fallback
    { path: '**', redirectTo: '' }
];

