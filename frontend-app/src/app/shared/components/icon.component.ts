import { Component, Input, SecurityContext, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-icon',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isSvg()" 
         [innerHTML]="getSafeSvg()" 
         [class]="svgClass" 
         [style.width.px]="dynamicSize" 
         [style.height.px]="dynamicSize"
         class="flex items-center justify-center fill-current"></div>
    <i *ngIf="!isSvg()" 
       [class]="getIconClass()" 
       [ngClass]="iconClass"
       [style.width.px]="dynamicSize" 
       [style.height.px]="dynamicSize" 
       [style.fontSize.px]="dynamicSize"
       class="flex items-center justify-center"></i>
  `,
    styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
    private sanitizer = inject(DomSanitizer);

    @Input() icon: string = '';

    // Backward-compatible alias: allow using `[name]` as input in templates
    @Input('name') set name(value: string) { if (value) this.icon = value; }

    @Input() iconClass: string = '';
    @Input() svgClass: string = 'w-5 h-5';

    // Optional numeric size attribute (e.g. size="18") to set inline Tailwind arbitrary width/height
    @Input() set size(value: string | number | undefined) {
        if (value === undefined || value === null) return;
        const v = typeof value === 'number' ? value : parseInt(String(value), 10);
        if (!isNaN(v)) {
            this.dynamicSize = v;
        }
    }

    dynamicSize: number = 20; // Default size if not set


    // Icon name mapping: Feather/Lucide -> PrimeIcons
    private iconMap: Record<string, string> = {
        'mail': 'envelope',
        'map-pin': 'map-marker',
        'phone': 'phone',
        'globe': 'globe',
        'building': 'building',
        'user': 'user',
        'user-plus': 'user-plus',
        'users': 'users',
        'check': 'check',
        'x': 'times',
        'plus': 'plus',
        'edit': 'pencil',
        'trash': 'trash',
        'info': 'info-circle',
        'alert-triangle': 'exclamation-triangle',
        'hash': 'hashtag',
        'home': 'home',
        'briefcase': 'briefcase',
        'calendar': 'calendar',
        'clock': 'clock',
        'save': 'save',
        'upload': 'upload',
        'download': 'download',
        'search': 'search',
        'filter': 'filter',
        'arrow-left': 'arrow-left',
        'arrow-right': 'arrow-right',
        'chevron-down': 'chevron-down',
        'chevron-up': 'chevron-up',
        'eye': 'eye',
        'eye-off': 'eye-slash',
        'lock': 'lock',
        'unlock': 'unlock',
        'settings': 'cog',
        'log-out': 'sign-out',
        'money-bill': 'money-bill',
        'refresh-cw': 'sync',
        'refresh': 'sync',
        'play': 'play',
        'shield': 'shield',
        'key': 'key',
        'gauge': 'sliders-h',
        'user-circle': 'user',
        'user-edit': 'pencil',
        'wallet': 'wallet',
        'sitemap': 'sitemap',
        'folder-open': 'folder-open',
        'archive': 'box',
        'identification': 'id-card',
        'currency-dollar': 'dollar',
        'user-group': 'users',
        'document': 'file',
        'list': 'list',
        'grid': 'th-large',
        'bell': 'bell'
    };

    isSvg(): boolean {
        return !!(this.icon && this.icon.trim().startsWith('<svg'));
    }

    getSafeSvg(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.icon);
    }

    getIconClass(): string {
        if (!this.icon) return '';

        // If already starts with pi-, use as-is
        if (this.icon.startsWith('pi-')) {
            return 'pi ' + this.icon;
        }

        // Map common icon names to PrimeIcons
        const mappedName = this.iconMap[this.icon] || this.icon;
        return 'pi pi-' + mappedName;
    }
}
