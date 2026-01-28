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
            [dismissableMask]="true"
            appendTo="body"
            header="Constructor de Dirección" 
            [style]="{width: '90%', maxWidth: '800px'}"
            [breakpoints]="{'960px': '95vw'}"
            styleClass="max-w-2xl w-full"
            (onHide)="close()">
            
            <div class="scrollbar-hide p-1">
                <!-- Live Preview -->
                <div class="relative mb-8 mx-2 sm:mx-4">
                    <div class="relative p-6 rounded-[2rem] overflow-hidden bg-brand-gradient shadow-2xl border border-white/10">
                        <!-- Decorative Orbs -->
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12"></div>
                        
                        <span class="text-[9px] font-black text-white/60 uppercase tracking-widest block mb-3">Vista Previa</span>
                        <p class="text-xl sm:text-2xl font-black text-white leading-tight min-h-[3rem]">
                            {{ addressPreview }}
                        </p>
                        <app-icon icon="map-pin" class="absolute bottom-4 right-6 w-8 h-8 text-white/20"></app-icon>
                    </div>
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
                    <button pButton label="Confirmar Dirección" (click)="confirm()" 
                        class="flex-1 bg-primary text-white rounded-2xl py-4 font-black shadow-xl order-1 sm:order-2"
                        [style.boxShadow]="'0 20px 25px -5px var(--primary-light)'"></button>
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
    @Output() addressCompleted = new EventEmitter<string>();
    @Output() addressClosed = new EventEmitter<void>();

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
        this.addressClosed.emit();
    }

    confirm() {
        if (this.addressPreview && this.addressPreview !== 'Esperando datos...') {
            this.addressCompleted.emit(this.addressPreview);
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
