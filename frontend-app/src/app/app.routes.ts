import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public/public-layout/public-layout';
import { LandingComponent } from './landing';
import { TermsComponent } from './public/terms.component';
import { PrivacyComponent } from './public/privacy.component';
import { CookiesComponent } from './public/cookies.component';
import { SecurityInfoComponent } from './public/security-info.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register';
import { SelectCompanyComponent } from './auth/select-company/select-company.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { HomeComponent } from './core/home/home.component';
import { superAdminGuard, authGuard, guestGuard } from './core/guards/auth.guard';
import { CompanyListComponent } from './core/companies/company-list.component';
import { CompanyFormComponent } from './core/companies/company-form.component';


export const routes: Routes = [
    // 1. Auth Routes (No Layout)
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'select-company', component: SelectCompanyComponent },

    // 1. Public Website (PublicLayout)
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

    // 2. Internal Application (MainLayout + Auth Guard)
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'core/management/users/profile', loadComponent: () => import('./core/management/users/profile/profile').then(m => m.ProfileComponent) },
            { path: 'core/management/users/profile/change-password', loadComponent: () => import('./core/management/users/profile/change-password.component').then(m => m.ChangePasswordComponent) },
            { path: 'core/companies', component: CompanyListComponent },
            { path: 'core/companies/create', component: CompanyFormComponent },
            { path: 'core/companies/edit/:id', component: CompanyFormComponent },
            { path: 'dashboard', component: DashboardComponent, canActivate: [superAdminGuard] }
        ]
    },

    // 4. Fallback
    { path: '**', redirectTo: '' }
];

