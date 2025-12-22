import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // ...existing routes...
  { path: 'terms', loadComponent: () => import('./public/terms.component').then(m => m.TermsComponent) },
  { path: 'privacy', loadComponent: () => import('./public/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'cookies', loadComponent: () => import('./public/cookies.component').then(m => m.CookiesComponent) },
  // opcional: ruta fallback
  // { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
