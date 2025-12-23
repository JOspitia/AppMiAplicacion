import { Directive, Inject, Self, OnInit } from '@angular/core';
import { Select } from 'primeng/select';

@Directive({
    selector: 'p-select',
    standalone: true
})
export class PrimeDropdownSettingsDirective implements OnInit {
    constructor(@Self() private dropdown: Select) { }

    ngOnInit() {
        // Enable filtering by default (Choice behavior)
        if (this.dropdown.filter === undefined) {
            this.dropdown.filter = true;
        }

        // Set default filter matching mode
        if (!this.dropdown.filterMatchMode) {
            this.dropdown.filterMatchMode = 'contains';
        }

        // Ensure styling consistency if desired
        // this.dropdown.styleClass = (this.dropdown.styleClass || '') + ' premium-dropdown';
    }
}
