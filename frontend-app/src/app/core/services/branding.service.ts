import { Injectable, signal, effect } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Branding {
    logoUrl: string | null;
    primaryColor: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class BrandingService {
    // Fallback static path as requested by USER
    private defaultLogo = `${environment.apiUrl}/public/assets/images/logo.png`;
    private defaultColor = '#6366f1'; // Default Indigo-600

    // Public state
    currentLogo = signal<string>(this.defaultLogo);
    currentPrimaryColor = signal<string>(this.defaultColor);

    constructor() {
        // Effect to apply color changes to the document
        effect(() => {
            const color = this.currentPrimaryColor();
            this.applyPrimaryColor(color);
        });
    }

    /**
     * Updates branding state from a company DTO
     */
    setBranding(branding: { logoUrl?: string | null, primaryColor?: string | null }) {
        if (branding.logoUrl) {
            let url = branding.logoUrl;
            // Prepend apiUrl if it's a private asset path
            if (url.startsWith('private-assets/')) {
                url = `${environment.apiUrl}/${url}`;
            }

            // Pre-cargamos la imagen para que esté lista en caché antes de mostrarla
            this.preloadImage(url);
            this.currentLogo.set(url);
        } else {
            this.currentLogo.set(this.defaultLogo);
        }

        if (branding.primaryColor) {
            this.currentPrimaryColor.set(branding.primaryColor);
        } else {
            this.currentPrimaryColor.set(this.defaultColor);
        }
    }

    /**
     * Pre-loads an image into browser cache
     */
    private preloadImage(url: string) {
        const img = new Image();
        img.src = url;
    }

    /**
     * Resets to default branding
     */
    reset() {
        this.currentLogo.set(this.defaultLogo);
        this.currentPrimaryColor.set(this.defaultColor);
    }

    /**
     * Injects CSS variables into the document root
     */
    private applyPrimaryColor(color: string) {
        const root = document.documentElement;

        // Base tokens
        root.style.setProperty('--primary', color);
        root.style.setProperty('--primary-rgb', this.hexToRgb(color));
        root.style.setProperty('--p-primary-color', color);

        // Calculate shades
        const darker = this.darkenColor(color, 15);
        const lighter = this.darkenColor(color, -20); // Negative = lighten
        const vibrant = this.adjustHue(color, 15); // Shift hue slightly

        // Extended tokens
        root.style.setProperty('--primary-dark', darker);
        root.style.setProperty('--primary-light', lighter);
        root.style.setProperty('--primary-vibrant', vibrant);

        // PrimeNG specific
        root.style.setProperty('--p-primary-hover-color', darker);
        root.style.setProperty('--p-primary-active-color', darker);

        // Select & Listbox options (hover/focus/selected)
        root.style.setProperty('--p-select-option-focus-background', `rgba(${this.hexToRgb(color)}, 0.1)`);
        root.style.setProperty('--p-select-option-selected-background', `rgba(${this.hexToRgb(color)}, 0.15)`);
        root.style.setProperty('--p-select-option-selected-focus-background', `rgba(${this.hexToRgb(color)}, 0.2)`);
        root.style.setProperty('--p-listbox-option-focus-background', `rgba(${this.hexToRgb(color)}, 0.1)`);
        root.style.setProperty('--p-listbox-option-selected-background', `rgba(${this.hexToRgb(color)}, 0.15)`);

        // Ensure focus labels/text are readable (optional, usually black/white works)
        // root.style.setProperty('--p-select-option-focus-color', darker);

        // Stop colors for gradients (Tailwind-like)
        root.style.setProperty('--primary-stop', vibrant);
    }

    /**
     * Converts hex to comma-separated RGB
     */
    private hexToRgb(hex: string): string {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }

    /**
     * Helper to adjust hue or lighten/darken
     */
    private adjustHue(hex: string, amount: number): string {
        return this.darkenColor(hex, -amount);
    }

    /**
     * Helper to darken a hex color (positive percent darkens, negative lightens)
     */
    private darkenColor(hex: string, percent: number): string {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

        // Parse to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Calculate factor
        const factor = (100 - percent) / 100;

        // Darken/Lighten
        r = Math.min(255, Math.floor(Math.max(0, r * factor)));
        g = Math.min(255, Math.floor(Math.max(0, g * factor)));
        b = Math.min(255, Math.floor(Math.max(0, b * factor)));

        // Back to hex
        const toHex = (c: number) => c.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}
