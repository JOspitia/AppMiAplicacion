import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconComponent } from '../icon.component';

@Component({
    selector: 'app-address-builder',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        IconComponent
    ],
    template: `
        <p-dialog 
            [(visible)]="isVisible" 
            [modal]="true" 
            [draggable]="false" 
            [resizable]="false" 
            header="Constructor de Dirección" 
            styleClass="max-w-2xl w-full"
            (onHide)="close()">
            
            <div class="p-4 sm:p-6 space-y-6 sm:space-y-8">
                <!-- Live Preview -->
                <div class="relative p-6 sm:p-8 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-indigo-500/20 overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <span class="text-[9px] font-black text-white/60 uppercase tracking-widest block mb-4">Vista Previa Real</span>
                    <p class="text-xl sm:text-2xl font-black text-white leading-tight min-h-[3rem]">
                        {{ addressPreview }}
                    </p>
                    <app-icon icon="map-pin" class="absolute bottom-4 sm:bottom-6 right-6 sm:right-8 w-10 sm:w-12 h-10 sm:h-12 text-white/20"></app-icon>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div class="sm:col-span-2 flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo de Vía</label>
                        <p-select [options]="addressOptions.types" [(ngModel)]="builder.type" (onChange)="updatePreview()" placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Número #1</label>
                        <input pInputText [(ngModel)]="builder.num1" (input)="updatePreview()" placeholder="13" class="w-full">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Letra</label>
                        <input pInputText [(ngModel)]="builder.letter1" (input)="updatePreview()" placeholder="B" class="w-full">
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Bis</label>
                        <p-select [options]="addressOptions.bis" [(ngModel)]="builder.bis" (onChange)="updatePreview()" placeholder="No" class="w-full" styleClass="w-full" appendTo="body"></p-select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Letra Bis</label>
                        <input pInputText [(ngModel)]="builder.letterBis" (input)="updatePreview()" placeholder="A" class="w-full">
                    </div>
                    <div class="sm:col-span-2 flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cuadrante</label>
                        <p-select [options]="addressOptions.quadrants" [(ngModel)]="builder.quadrant1" (onChange)="updatePreview()" placeholder="Ninguno" class="w-full" styleClass="w-full" appendTo="body"></p-select>
                    </div>

                    <div class="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center gap-4 py-2 opacity-50">
                        <div class="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                        <app-icon icon="hashtag" class="w-4 h-4 text-slate-400"></app-icon>
                        <div class="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Número #2</label>
                        <input pInputText [(ngModel)]="builder.num2" (input)="updatePreview()" placeholder="45" class="w-full">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Letra #2</label>
                        <input pInputText [(ngModel)]="builder.letter2" (input)="updatePreview()" placeholder="C" class="w-full">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Número #3</label>
                        <input pInputText [(ngModel)]="builder.num3" (input)="updatePreview()" placeholder="30" class="w-full">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cuadrante #2</label>
                        <p-select [options]="addressOptions.quadrants" [(ngModel)]="builder.quadrant2" (onChange)="updatePreview()" placeholder="Ninguno" class="w-full" styleClass="w-full" appendTo="body"></p-select>
                    </div>

                    <div class="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Complemento</label>
                            <p-select [options]="addressOptions.complements" [(ngModel)]="builder.complementType" (onChange)="updatePreview()" placeholder="Apto" class="w-full" styleClass="w-full" appendTo="body"></p-select>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Valor</label>
                            <input pInputText [(ngModel)]="builder.complementValue" (input)="updatePreview()" placeholder="402" class="w-full">
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <button pButton label="Limpiar" (click)="clearAddressBuilder()" class="p-button-text p-button-secondary font-bold order-2 sm:order-1"></button>
                    <button pButton label="Confirmar Dirección" (click)="confirm()" class="flex-1 bg-primary text-white rounded-2xl py-4 font-black shadow-xl shadow-indigo-500/20 order-1 sm:order-2"></button>
                </div>
            </div>
        </p-dialog>
    `
})
export class AddressBuilderComponent {
    @Input() set visible(value: boolean) {
        this.isVisible = value;
    }
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onConfirm = new EventEmitter<string>();

    isVisible = false;
    addressPreview = 'Esperando datos...';

    builder = {
        type: '',
        num1: '',
        letter1: '',
        bis: '',
        letterBis: '',
        quadrant1: '',
        num2: '',
        letter2: '',
        num3: '',
        quadrant2: '',
        complementType: '',
        complementValue: ''
    };

    addressOptions = {
        types: [
            { label: 'Calle', value: 'Calle' },
            { label: 'Carrera', value: 'Carrera' },
            { label: 'Avenida', value: 'Avenida' },
            { label: 'Transversal', value: 'Transversal' },
            { label: 'Diagonal', value: 'Diagonal' },
            { label: 'Circular', value: 'Circular' },
            { label: 'Autopista', value: 'Autopista' }
        ],
        bis: [
            { label: 'No', value: '' },
            { label: 'Bis', value: 'Bis' }
        ],
        quadrants: [
            { label: 'Ninguno', value: '' },
            { label: 'Norte', value: 'Norte' },
            { label: 'Sur', value: 'Sur' },
            { label: 'Este', value: 'Este' },
            { label: 'Oeste', value: 'Oeste' }
        ],
        complements: [
            { label: 'Apartamento', value: 'Apto' },
            { label: 'Oficina', value: 'Oficina' },
            { label: 'Local', value: 'Local' },
            { label: 'Bodega', value: 'Bodega' },
            { label: 'Interior', value: 'Int' }
        ]
    };

    close() {
        this.isVisible = false;
        this.visibleChange.emit(false);
    }

    confirm() {
        if (this.addressPreview && this.addressPreview !== 'Esperando datos...') {
            this.onConfirm.emit(this.addressPreview);
            this.close();
        }
    }

    updatePreview() {
        const parts = [
            this.builder.type,
            this.builder.num1,
            this.builder.letter1,
            this.builder.bis,
            this.builder.letterBis,
            this.builder.quadrant1,
            this.builder.num2 ? '#' : '',
            this.builder.num2,
            this.builder.letter2,
            this.builder.num3 ? '-' : '',
            this.builder.num3,
            this.builder.quadrant2,
            this.builder.complementType,
            this.builder.complementValue
        ];

        const preview = parts.filter(p => p).join(' ').trim();
        this.addressPreview = preview || 'Esperando datos...';
    }

    clearAddressBuilder() {
        this.builder = {
            type: '',
            num1: '',
            letter1: '',
            bis: '',
            letterBis: '',
            quadrant1: '',
            num2: '',
            letter2: '',
            num3: '',
            quadrant2: '',
            complementType: '',
            complementValue: ''
        };
        this.addressPreview = 'Esperando datos...';
    }
}
