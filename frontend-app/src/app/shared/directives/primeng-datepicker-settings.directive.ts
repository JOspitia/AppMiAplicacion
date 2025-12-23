import { Directive, Self, OnInit } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';

@Directive({
    selector: 'p-datepicker',
    standalone: true
})
export class PrimeDatePickerSettingsDirective implements OnInit {
    constructor(@Self() private datePicker: DatePicker) { }

    ngOnInit() {
        // Global defaults for all datepickers
        if (!this.datePicker.dateFormat) {
            this.datePicker.dateFormat = 'yy-mm-dd';
        }
        if (this.datePicker.showIcon === undefined) {
            this.datePicker.showIcon = true;
        }

        // Add default styling class if not present
        // This helps enforce the 'premium-calendar' look globally without repeating class="premium-calendar" everywhere
        /* 
        if (!this.datePicker.styleClass?.includes('premium-datepicker')) {
             this.datePicker.styleClass = (this.datePicker.styleClass || '') + ' premium-datepicker';
        }
        */
    }
}
