import { Component, Input, SecurityContext, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-icon',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isSvg()" [innerHTML]="getSafeSvg()" [class]="svgClass" class="flex items-center justify-center fill-current"></div>
    <i *ngIf="!isSvg()" [class]="getIconClass()" [ngClass]="iconClass"></i>
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
            // Using arbitrary value syntax so values like 18 become w-[18px]
            this.svgClass = `w-[${v}px] h-[${v}px]`;
            // For icon fonts, apply a similar size class so icons scale
            this.iconClass = `w-[${v}px] h-[${v}px]`;
        }
    }

    isSvg(): boolean {
        return !!(this.icon && this.icon.trim().startsWith('<svg'));
    }


    getSafeSvg(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.icon);
    }

    getIconClass(): string {
        if (!this.icon) return '';
        return 'pi ' + (this.icon.startsWith('pi-') ? this.icon : 'pi-' + this.icon);
    }
}
