import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public/public-layout/public-layout';
import { LandingComponent } from './landing';
import { TermsComponent } from './public/terms.component';
import { PrivacyComponent } from './public/privacy.component';
import { CookiesComponent } from './public/cookies.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register';
import { SelectCompanyComponent } from './auth/select-company/select-company.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { HomeComponent } from './core/home/home.component';
import { superAdminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Auth Routes (No Layout)
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'select-company',
        component: SelectCompanyComponent
    },
    // Internal App Routes (With MainLayout)
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'core/management/users/profile', loadComponent: () => import('./core/management/users/profile/profile').then(m => m.ProfileComponent) },
            { path: 'dashboard', component: DashboardComponent, canActivate: [superAdminGuard] },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    // Public Routes (With PublicLayout)
    {
        path: 'landing',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: LandingComponent },
            { path: 'terms', component: TermsComponent },
            { path: 'privacy', component: PrivacyComponent },
            { path: 'cookies', component: CookiesComponent }
        ]
    },
    { path: '**', redirectTo: '/landing' }
];

