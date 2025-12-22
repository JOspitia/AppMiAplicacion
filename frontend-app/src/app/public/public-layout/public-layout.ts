import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';
import { CookieConsentComponent } from '../cookie-consent/cookie-consent';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, CookieConsentComponent],
  template: `
    <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/10 selection:text-primary">
      <app-navbar></app-navbar>
      
      <main>
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <!-- Global Cookie Consent -->
      <app-cookie-consent></app-cookie-consent>
    </div>
  `
})
export class PublicLayoutComponent { }
