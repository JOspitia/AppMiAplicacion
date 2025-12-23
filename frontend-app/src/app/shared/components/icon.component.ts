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
    @Input() iconClass: string = '';
    @Input() svgClass: string = 'w-5 h-5';

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
