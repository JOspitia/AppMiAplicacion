import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public/public-layout/public-layout';
import { LandingComponent } from './landing';
import { TermsComponent } from './public/terms.component';
import { PrivacyComponent } from './public/privacy.component';
import { CookiesComponent } from './public/cookies.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register';
import { SelectCompanyComponent } from './auth/select-company/select-company.component';

export const routes: Routes = [
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
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: LandingComponent },
            { path: 'terms', component: TermsComponent },
            { path: 'privacy', component: PrivacyComponent },
            { path: 'cookies', component: CookiesComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];
