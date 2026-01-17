import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DatePickerModule } from 'primeng/datepicker';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { WorkScheduleService, WorkSchedule, WorkScheduleDay } from '../../core/services/work-schedule.service';
import { BrandingService } from '../../core/services/branding.service';

@Component({
    selector: 'app-work-schedule-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, SelectModule, TextareaModule,
        ToggleSwitchModule, InputNumberModule, ColorPickerModule,
        DatePickerModule, IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
        <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>
        
        <!-- Header Section -->
        <div class="max-w-6xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Recursos Humanos</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Horario Laboral</span>
                    </h1>
                </div>
                <button [routerLink]="['/rrhh/work-schedules']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Configura los horarios de trabajo, define turnos semanales o ciclos personalizados.
            </p>
        </div>

        <!-- Form Container -->
        <div class="max-w-6xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 p-8 md:p-12">
                
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-12">
                    
                    <!-- Section 1: General Information -->
                    <div>
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <app-icon name="document" size="20" class="text-slate-400"></app-icon>
                                Información General
                            </h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Horario *</label>
                                <div class="relative group">
                                    <app-icon name="clock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" 
                                           placeholder="Ej: Turno Diurno, Rotación 14 días..." 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                                <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-rose-500 text-[10px] font-bold ml-1">El nombre es obligatorio</small>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo de Horario *</label>
                                <p-select formControlName="scheduleType" [options]="scheduleTypes" optionLabel="label" optionValue="value" 
                                          placeholder="Seleccionar tipo" styleClass="w-full" appendTo="body"></p-select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div class="flex flex-col gap-2" *ngIf="form.get('scheduleType')?.value === 'CYCLICAL'">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Días del Ciclo *</label>
                                <p-inputNumber formControlName="cycleLengthDays" mode="decimal" [min]="1" [max]="365" [showButtons]="true" 
                                               inputStyleClass="w-full font-bold text-center !bg-transparent" 
                                               styleClass="w-full" class="w-full"></p-inputNumber>
                                <small class="text-[10px] text-slate-400 ml-1 italic">Ej: 14 para rotación quincenal</small>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tolerancia (min)</label>
                                <p-inputNumber formControlName="toleranceMinutes" mode="decimal" [min]="0" [max]="60" [showButtons]="true" 
                                               inputStyleClass="w-full font-bold text-center !bg-transparent" 
                                               styleClass="w-full" class="w-full"></p-inputNumber>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Máx. Horas/Sem</label>
                                <p-inputNumber formControlName="maxWeeklyHours" mode="decimal" [min]="1" [max]="168" [showButtons]="true" 
                                               inputStyleClass="w-full font-bold text-center !bg-transparent" 
                                               styleClass="w-full" class="w-full"></p-inputNumber>
                            </div>

                            <div class="flex flex-col gap-2 md:col-span-1">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Color Identificador</label>
                                <div class="flex items-center gap-3">
                                    <div class="relative w-12 h-12 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 bg-slate-50 dark:bg-slate-800">
                                        <input type="color" formControlName="color" 
                                               class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer">
                                    </div>
                                    <div class="flex-1 relative group">
                                        <input pInputText formControlName="color" 
                                               placeholder="#RRGGBB" 
                                               class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>
                                <small class="text-[10px] text-slate-400 ml-1 italic text-right">Haz clic en el recuadro para seleccionar</small>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 mt-6">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                            <textarea pTextarea formControlName="description" rows="3" 
                                      placeholder="Describe las características de este horario..."
                                      class="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                        </div>

                        <!-- Cycle Visualizer (only for CYCLICAL schedules) -->
                        <div *ngIf="form.get('scheduleType')?.value === 'CYCLICAL'" class="mt-6 animate-fade-in">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-3 block">
                                <app-icon name="calendar-days" class="w-3 h-3 inline mr-1"></app-icon>
                                Visualización del Ciclo
                            </label>
                            <div class="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                                    <div *ngFor="let day of daysArray.controls; let i = index" 
                                         class="flex-shrink-0 transition-all duration-300 hover:scale-105">
                                        <div [class]="day.get('isRestDay')?.value 
                                                      ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600' 
                                                      : 'bg-gradient-to-br from-primary to-primary-dark border-primary shadow-lg shadow-primary/20'"
                                             class="w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
                                            <!-- Day Number -->
                                            <span [class]="day.get('isRestDay')?.value 
                                                          ? 'text-slate-500 dark:text-slate-400' 
                                                          : 'text-white'"
                                                  class="text-xs font-semibold">Día {{ i + 1 }}</span>
                                            
                                            <!-- Icon -->
                                            <app-icon [name]="day.get('isRestDay')?.value ? 'moon' : 'briefcase'"
                                                     [class]="day.get('isRestDay')?.value 
                                                              ? 'text-slate-400 dark:text-slate-500' 
                                                              : 'text-white/90'"
                                                     class="w-5 h-5"></app-icon>
                                            
                                            <!-- Hours (if work day) -->
                                            <span *ngIf="!day.get('isRestDay')?.value && day.get('startTime')?.value && day.get('endTime')?.value"
                                                  class="text-[9px] font-bold text-white/80">
                                                {{ calculateDayHours(i) }}h
                                            </span>

                                            <!-- Shimmer effect on work days -->
                                            <div *ngIf="!day.get('isRestDay')?.value" 
                                                 class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Cycle Info -->
                                <div class="mt-4 flex items-center justify-between text-xs">
                                    <div class="flex items-center gap-4">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 rounded bg-gradient-to-br from-primary to-primary-dark"></div>
                                            <span class="text-slate-600 dark:text-slate-400 font-medium">Trabajo</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            <span class="text-slate-600 dark:text-slate-400 font-medium">Descanso</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <app-icon name="repeat" class="w-4 h-4"></app-icon>
                                        <span class="font-bold">Ciclo de {{ form.get('cycleLengthDays')?.value }} días</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Schedule Grid -->
                    <div>
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <app-icon name="calendar" size="20" class="text-slate-400"></app-icon>
                                {{ form.get('scheduleType')?.value === 'WEEKLY' ? 'Configuración Semanal' : 'Configuración del Ciclo' }}
                            </h2>
                        </div>

                        <!-- Quick Action: Apply to All Days -->
                        <div class="flex justify-end mb-4">
                            <button type="button" (click)="applyToAllDays()" 
                                    class="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all font-bold text-sm group">
                                <app-icon name="copy" class="w-4 h-4 group-hover:scale-110 transition-transform"></app-icon>
                                Aplicar Día 1 a Todos
                            </button>
                        </div>

                        <div class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div class="grid grid-cols-[120px,1fr,1fr,1fr,100px,120px] gap-px bg-slate-200 dark:bg-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors duration-300">
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 transition-colors duration-300">Día</div>
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 text-center transition-colors duration-300">Hora Inicio</div>
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 text-center transition-colors duration-300">Hora Fin</div>
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 text-center transition-colors duration-300">Descanso (min)</div>
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 text-center transition-colors duration-300">Turno Nocturno</div>
                                <div class="bg-slate-100 dark:bg-slate-800 p-3 text-center transition-colors duration-300">Descanso</div>
                            </div>

                            <div formArrayName="days">
                                <div *ngFor="let dayControl of daysArray.controls; let i = index" 
                                     [formGroupName]="i"
                                     class="border-b border-slate-200 dark:border-slate-700 last:border-0 transition-all duration-300"
                                     [ngClass]="{'bg-slate-50 dark:bg-slate-800/30': getSlotsArray(i).length > 0}">
                                    
                                    <!-- SINGLE SLOT MODE (Legacy) - Show only if NO slots defined -->
                                    <div *ngIf="getSlotsArray(i).length === 0" 
                                         class="grid grid-cols-[120px,1fr,1fr,1fr,100px,120px] gap-px bg-slate-200 dark:bg-slate-700 transition-colors duration-300">
                                        
                                        <!-- Day Label & Split Trigger -->
                                        <div class="bg-white dark:bg-slate-800/50 p-3 flex flex-col justify-center relative group transition-colors duration-300">
                                            <span class="font-bold text-sm transition-colors duration-300" [ngClass]="{'text-slate-300': dayControl.get('isRestDay')?.value}">{{ getDayLabel(i) }}</span>
                                            
                                            <!-- Button to convert to Split Shift - Improved Visibility -->
                                            <button type="button" (click)="addTimeSlot(i)" *ngIf="!dayControl.get('isRestDay')?.value"
                                                    class="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Dividir Jornada (Turnos)">
                                                <app-icon name="plus-circle" class="w-4 h-4"></app-icon>
                                            </button>
                                        </div>

                                        <div class="bg-white dark:bg-slate-800/50 p-2 flex items-center justify-center transition-colors duration-300">
                                            <p-datepicker formControlName="startTime" [timeOnly]="true" hourFormat="12" 
                                                         appendTo="body" placeholder="--:--" [showIcon]="true" iconDisplay="input"
                                                         styleClass="w-full" inputStyleClass="py-1.5 text-center font-bold !bg-transparent !border-0"></p-datepicker>
                                        </div>

                                        <div class="bg-white dark:bg-slate-800/50 p-2 flex items-center justify-center transition-colors duration-300">
                                            <p-datepicker formControlName="endTime" [timeOnly]="true" hourFormat="12" 
                                                         appendTo="body" placeholder="--:--" [showIcon]="true" iconDisplay="input"
                                                         styleClass="w-full" inputStyleClass="py-1.5 text-center font-bold !bg-transparent !border-0"></p-datepicker>
                                        </div>

                                        <div class="bg-white dark:bg-slate-800/50 p-2 flex items-center justify-center transition-colors duration-300">
                                            <p-inputnumber formControlName="breakMinutes" [showButtons]="true"
                                                         buttonLayout="horizontal" spinnerMode="horizontal"
                                                         incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                                         inputStyleClass="w-full text-center font-bold py-1.5 !bg-transparent !border-0"
                                                         styleClass="w-full"></p-inputnumber>
                                        </div>

                                        <div class="bg-white dark:bg-slate-800/50 p-2 flex items-center justify-center transition-colors duration-300">
                                            <p-toggleswitch formControlName="isNextDay"></p-toggleswitch>
                                        </div>

                                        <div class="bg-white dark:bg-slate-800/50 p-2 flex items-center justify-center transition-colors duration-300">
                                            <p-toggleswitch formControlName="isRestDay" (onChange)="onRestDayChange(i)"></p-toggleswitch>
                                        </div>
                                    </div>

                                    <!-- MULTI SLOT MODE (Split Shift) -->
                                    <div *ngIf="getSlotsArray(i).length > 0" class="flex">
                                        <!-- Sidebar Day Label -->
                                        <div class="w-[120px] bg-white dark:bg-slate-800/50 p-3 flex flex-col items-start gap-2 border-r border-slate-200 dark:border-slate-700">
                                            <span class="font-bold text-sm text-primary">{{ getDayLabel(i) }}</span>
                                            <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Jornada Partida</span>
                                            
                                            <button type="button" (click)="clearTimeSlots(i)" 
                                                    class="text-[9px] text-slate-400 hover:text-rose-500 transition-colors mt-auto flex items-center gap-1 group/btn font-medium">
                                                <app-icon name="undo-2" class="w-2.5 h-2.5 group-hover/btn:-rotate-45 transition-transform"></app-icon>
                                                <span>Volver a simple</span>
                                            </button>
                                        </div>

                                        <!-- Slots Container - Horizontal padding removed for header alignment -->
                                        <div class="flex-1 py-1 flex flex-col gap-px min-w-0">
                                            <div formArrayName="timeSlots">
                                                <div *ngFor="let slot of getSlotsArray(i).controls; let k = index" [formGroupName]="k"
                                                     class="grid grid-cols-[1fr,1fr,1fr,100px,120px] gap-px bg-slate-200 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors duration-300">
                                                    
                                                    <!-- Start Time Column (Matches "HORA INICIO") -->
                                                    <div class="bg-white dark:bg-slate-800/40 p-2 flex items-center justify-center relative transition-colors duration-300 h-full">
                                                        <span class="absolute left-3 text-[9px] font-black text-slate-400">#{{k+1}}</span>
                                                        <p-datepicker formControlName="startTime" [timeOnly]="true" hourFormat="12" 
                                                                     appendTo="body" placeholder="--:--" [showIcon]="true" iconDisplay="input"
                                                                     styleClass="w-full max-w-[140px]" inputStyleClass="py-1.5 text-center font-bold text-xs !bg-transparent !border-0"></p-datepicker>
                                                    </div>
                                                    
                                                    <!-- End Time Column (Matches "HORA FIN") -->
                                                    <div class="bg-white dark:bg-slate-800/40 p-2 flex items-center justify-center transition-colors duration-300 h-full">
                                                        <p-datepicker formControlName="endTime" [timeOnly]="true" hourFormat="12" 
                                                                     appendTo="body" placeholder="--:--" [showIcon]="true" iconDisplay="input"
                                                                     styleClass="w-full max-w-[140px]" inputStyleClass="py-1.5 text-center font-bold text-xs !bg-transparent !border-0"></p-datepicker>
                                                    </div>
                                                    
                                                    <!-- Break Column (Matches "DESCANSO (MIN)") -->
                                                    <div class="bg-white dark:bg-slate-800/40 p-2 flex items-center justify-center gap-2 transition-colors duration-300 h-full">
                                                        <p-inputnumber formControlName="breakMinutes" 
                                                                      inputStyleClass="w-12 text-center font-bold text-xs !bg-transparent !border-0"
                                                                      styleClass="w-auto h-auto"></p-inputnumber>
                                                        <span class="text-[9px] text-slate-400 font-bold uppercase">min</span>
                                                    </div>

                                                    <!-- Next Day Column (Matches "TURNO NOCTURNO") -->
                                                    <div class="bg-white dark:bg-slate-800/40 p-2 flex flex-col items-center gap-0.5 justify-center transition-colors duration-300 h-full">
                                                        <p-toggleswitch formControlName="isNextDay" size="small"></p-toggleswitch>
                                                        <span class="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Día Sig.</span>
                                                    </div>

                                                    <!-- Actions Column (Matches "DESCANSO" - used for Delete) -->
                                                    <div class="bg-white dark:bg-slate-800/40 p-2 flex items-center justify-center transition-colors duration-300 h-full">
                                                        <button type="button" (click)="removeTimeSlot(i, k)" 
                                                                class="p-2 text-rose-500/70 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition-all"
                                                                title="Eliminar turno">
                                                            <app-icon name="times" size="22" iconClass="text-rose-500"></app-icon>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="p-3 bg-white dark:bg-slate-800/20">
                                                <button type="button" (click)="addTimeSlot(i)" 
                                                        class="text-[10px] font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 flex items-center gap-2 transition-all">
                                                    <app-icon name="plus" class="w-3 h-3"></app-icon>
                                                    Añadir Turno
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 p-4 rounded-xl border transition-all duration-300"
                             [ngClass]="isOverHours() ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'">
                            <div class="flex items-start gap-3">
                                <app-icon [name]="isOverHours() ? 'alert-circle' : 'circle-check'" 
                                          [class]="isOverHours() ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
                                          class="w-5 h-5 mt-0.5"></app-icon>
                                <div class="flex-1">
                                    <p class="text-sm font-black transition-colors"
                                       [ngClass]="isOverHours() ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-200'">
                                        Total Horas Semanales: {{ totalWeeklyHours() | number:'1.0-1' }}
                                    </p>
                                    <p class="text-[11px] font-medium leading-tight"
                                       [ngClass]="isOverHours() ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-300'">
                                        {{ isOverHours() ? 'Atención: Has superado el límite de ' + form.get('maxWeeklyHours')?.value + 'h semanales permitidas.' : 'El cálculo se ajusta automáticamente según la configuración de cada día y el tipo de ciclo.' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-end gap-4 pt-10 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/rrhh/work-schedules']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <div class="flex flex-col items-end gap-2">
                            <button type="submit" [disabled]="form.invalid || loading() || isOverHours()"
                                    class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-3">
                                <app-icon *ngIf="!loading()" name="save" size="18"></app-icon>
                                <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                                <span>{{ loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar Horario' : 'Crear Horario') }}</span>
                            </button>
                            <small *ngIf="isOverHours()" class="text-rose-500 font-bold text-[10px] animate-pulse">Límite de horas excedido</small>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    </div>
    `
})
export class WorkScheduleFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(WorkScheduleService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private brandingService = inject(BrandingService);

    form: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        description: [''],
        scheduleType: ['WEEKLY', Validators.required],
        cycleLengthDays: [7, [Validators.min(1), Validators.max(365)]],
        toleranceMinutes: [0, [Validators.min(0), Validators.max(60)]],
        maxWeeklyHours: [46, [Validators.min(1), Validators.max(168)]],
        color: [this.brandingService.currentPrimaryColor()],
        referenceDate: [null],
        firstDayOfWeek: [1, [Validators.min(1), Validators.max(7)]],
        active: [true],
        days: this.fb.array([])
    });

    isEditMode = signal(false);
    itemId = signal<string | null>(null);
    loading = signal(false);
    errorMessage = signal<string | null>(null);

    scheduleTypes = [
        { label: 'Horario Semanal (Lun-Dom)', value: 'WEEKLY' },
        { label: 'Horario Cíclico (Rotación)', value: 'CYCLICAL' }
    ];

    weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    get daysArray(): FormArray {
        return this.form.get('days') as FormArray;
    }

    maxHoursSignal = signal(46); // Default value matching form
    totalWeeklyHours = signal(0);

    isOverHours = computed(() => {
        return this.totalWeeklyHours() > this.maxHoursSignal();
    });

    /**
     * Helper to safely get total minutes from either String or Date
     */
    private getMinutes(value: any): number {
        if (!value) return 0;
        if (value instanceof Date) {
            return value.getHours() * 60 + value.getMinutes();
        }
        if (typeof value === 'string' && value.includes(':')) {
            const parts = value.split(':');
            const h = parseInt(parts[0], 10) || 0;
            const m = parseInt(parts[1], 10) || 0;
            return h * 60 + m;
        }
        return 0;
    }

    private getDurationMinutes(startTime: any, endTime: any, isNextDay: boolean = false): number {
        if (!startTime || !endTime) return 0;
        const sMin = this.getMinutes(startTime);
        const eMin = this.getMinutes(endTime);

        // CASE 1: Normal natural duration (modulo 24h)
        // This handles cases like 22:00 to 06:00 automatically (8h)
        let duration = (eMin - sMin + 1440) % 1440;

        // CASE 2: Exactly 24h shift (e.g. 08:00 to 08:00)
        // Modulo gives 0, but if isNextDay is checked, we treat it as 24h
        if (duration === 0 && isNextDay) {
            duration = 1440;
        }

        return duration;
    }

    calculateHours() {
        const days = this.form.getRawValue().days;
        const scheduleType = this.form.get('scheduleType')?.value;
        const cycleLength = this.form.get('cycleLengthDays')?.value || 7;
        let totalHours = 0;

        for (const day of days) {
            if (day.isRestDay) continue;

            let dayMinutes = 0;
            if (day.timeSlots && day.timeSlots.length > 0) {
                day.timeSlots.forEach((slot: any) => {
                    dayMinutes += this.getDurationMinutes(slot.startTime, slot.endTime, slot.isNextDay);
                    dayMinutes -= (slot.breakMinutes || 0);
                });
            } else {
                dayMinutes += this.getDurationMinutes(day.startTime, day.endTime, day.isNextDay);
                dayMinutes -= (day.breakMinutes || 0);
            }

            totalHours += Math.max(0, dayMinutes) / 60;
        }

        // Normalize to weekly for cyclical schedules
        if (scheduleType === 'CYCLICAL' && cycleLength > 0) {
            totalHours = (totalHours / cycleLength) * 7;
        }

        this.totalWeeklyHours.set(Math.round(totalHours * 10) / 10);
    }

    ngOnInit() {
        this.initializeDays();

        // Subscribe to form changes for real-time calculation
        this.form.valueChanges.subscribe(() => {
            this.calculateHours();
        });

        // Rebuild days when schedule type changes (force clear)
        this.form.get('scheduleType')?.valueChanges.subscribe(() => {
            this.initializeDays(false);
        });

        // Smart resize when cycle length changes (preserve data)
        this.form.get('cycleLengthDays')?.valueChanges.subscribe((value) => {
            if (this.form.get('scheduleType')?.value === 'CYCLICAL') {
                this.initializeDays(true);
            }
        });

        // Trigger validation immediatele when Max Hours changes
        this.form.get('maxWeeklyHours')?.valueChanges.subscribe(() => {
            // Force re-evaluation of computed signal by updating a dependency dummy or just relying on template
            // Actually, simply calling calculateHours() again isn't needed if total hasn't changed, 
            // BUT we need to trigger the computed 'isOverHours'.
            // Since isOverHours depends on form.get('maxWeeklyHours').value, we need to make sure Angular creates a dependency.
            // Best way: Update a signal specifically for max hours or force check.
            this.maxHoursSignal.set(this.form.get('maxWeeklyHours')?.value || 0);
        });

        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEditMode.set(true);
            this.itemId.set(id);
            this.loadItem(id);
        }
    }

    initializeDays(keepExisting: boolean = false) {
        const scheduleType = this.form.get('scheduleType')?.value;
        const cycleDays = this.form.get('cycleLengthDays')?.value || 7;
        const targetCount = scheduleType === 'WEEKLY' ? 7 : cycleDays;

        const currentCount = this.daysArray.length;

        // Condition 1: Switching types completely -> Clear and rebuild
        // Condition 2: Not asking to keep data -> Clear and rebuild
        if (!keepExisting) {
            this.daysArray.clear();
            for (let i = 0; i < targetCount; i++) {
                this.daysArray.push(this.createDayGroup(i + 1));
            }
            return;
        }

        // smart adjustment logic for CYCLICAL resizing
        if (targetCount > currentCount) {
            // Add only missing days
            for (let i = currentCount; i < targetCount; i++) {
                this.daysArray.push(this.createDayGroup(i + 1));
            }
        } else if (targetCount < currentCount) {
            // Remove excess days from the end
            for (let i = currentCount; i > targetCount; i--) {
                this.daysArray.removeAt(i - 1);
            }
        }
        // If equal, do nothing (preserve data)
    }

    onRestDayChange(index: number, isRest?: boolean) {
        const group = this.daysArray.at(index) as FormGroup;
        const restValue = isRest ?? group.get('isRestDay')?.value;

        if (restValue) {
            group.get('startTime')?.disable();
            group.get('endTime')?.disable();
            group.get('breakMinutes')?.disable();
            group.get('isNextDay')?.disable();
        } else {
            group.get('startTime')?.enable();
            group.get('endTime')?.enable();
            group.get('breakMinutes')?.enable();
            group.get('isNextDay')?.enable();
        }
    }

    applyToAllDays() {
        if (this.daysArray.length === 0) return;

        const firstDay = this.daysArray.at(0).value;
        for (let i = 1; i < this.daysArray.length; i++) {
            this.daysArray.at(i).patchValue({
                startTime: firstDay.startTime,
                endTime: firstDay.endTime,
                breakMinutes: firstDay.breakMinutes,
                isNextDay: firstDay.isNextDay,
                isRestDay: firstDay.isRestDay
            });
            this.onRestDayChange(i, firstDay.isRestDay);
        }
        this.calculateHours();
    }

    calculateDayHours(index: number): number {
        const day = this.daysArray.at(index).getRawValue();
        if (day.isRestDay) return 0;

        let totalMinutes = 0;
        if (day.timeSlots && day.timeSlots.length > 0) {
            day.timeSlots.forEach((slot: any) => {
                totalMinutes += this.getDurationMinutes(slot.startTime, slot.endTime, slot.isNextDay);
                totalMinutes -= (slot.breakMinutes || 0);
            });
        } else {
            totalMinutes += this.getDurationMinutes(day.startTime, day.endTime, day.isNextDay);
            totalMinutes -= (day.breakMinutes || 0);
        }

        return Math.max(0, Math.round((totalMinutes / 60) * 10) / 10);
    }

    /**
     * Helper to convert Time String to Date object for PrimeNG
     */
    private parseTimeToDate(timeStr: string | undefined | null): Date | null {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return date;
    }

    private formatTimeToString(date: any): string {
        if (!date) return '00:00';
        if (typeof date === 'string') return date;
        const d = date as Date;
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * AUTO-AMANECIDA LOGIC (Smart Detector)
     */
    private autoDetectNextDay(group: FormGroup) {
        const start = group.get('startTime')?.value;
        const end = group.get('endTime')?.value;
        if (!start || !end) return;

        const sMin = this.getMinutes(start);
        const eMin = this.getMinutes(end);

        // Auto-detect if end is earlier than start (crossing midnight)
        if (eMin < sMin) {
            group.get('isNextDay')?.setValue(true, { emitEvent: false });
        } else if (eMin > sMin) {
            // If user previously had it ON but corrected times to a normal shift, turn it OFF
            group.get('isNextDay')?.setValue(false, { emitEvent: false });
        }
    }

    createDayGroup(dayNumber: number): FormGroup {
        const group = this.fb.group({
            dayNumber: [dayNumber],
            isRestDay: [false],
            startTime: [this.parseTimeToDate('08:00')],
            endTime: [this.parseTimeToDate('17:00')],
            isNextDay: [false],
            breakMinutes: [60],
            timeSlots: this.fb.array([])
        });

        // Enable auto-amanecida for simple mode
        group.get('startTime')?.valueChanges.subscribe(() => this.autoDetectNextDay(group));
        group.get('endTime')?.valueChanges.subscribe(() => this.autoDetectNextDay(group));

        return group;
    }

    createTimeSlotGroup(startTime: string = '08:00', endTime: string = '12:00'): FormGroup {
        const group = this.fb.group({
            slotOrder: [1],
            startTime: [this.parseTimeToDate(startTime)],
            endTime: [this.parseTimeToDate(endTime)],
            isNextDay: [false],
            breakMinutes: [0] // Breaks usually between slots, but option kept
        });

        // Enable auto-amanecida for slot
        group.get('startTime')?.valueChanges.subscribe(() => this.autoDetectNextDay(group));
        group.get('endTime')?.valueChanges.subscribe(() => this.autoDetectNextDay(group));

        return group;
    }

    // Helper to get slots array from a specific day
    getSlotsArray(dayIndex: number): FormArray {
        return this.daysArray.at(dayIndex).get('timeSlots') as FormArray;
    }

    addTimeSlot(dayIndex: number) {
        const slots = this.getSlotsArray(dayIndex);

        // If it's the first slot being added, migrate legacy values?
        // Strategy: If adding slots, we assume advanced mode. 
        // We can pre-fill based on legacy if empty, or just clean slate.
        // Let's clean slate for "Split Shift" concept usually implies defining specific blocks.
        if (slots.length === 0) {
            slots.push(this.createTimeSlotGroup('08:00', '13:00'));
            slots.push(this.createTimeSlotGroup('15:00', '19:00')); // Default split suggestion
        } else {
            // Add a generic slot later in day
            slots.push(this.createTimeSlotGroup('19:00', '22:00'));
        }
        this.calculateHours();
    }

    removeTimeSlot(dayIndex: number, slotIndex: number) {
        const slots = this.getSlotsArray(dayIndex);
        slots.removeAt(slotIndex);
        this.calculateHours();
    }

    clearTimeSlots(dayIndex: number) {
        const slots = this.getSlotsArray(dayIndex);
        slots.clear();
        this.calculateHours();
    }

    getDayLabel(index: number): string {
        const scheduleType = this.form.get('scheduleType')?.value;
        if (scheduleType === 'WEEKLY') {
            return this.weekDays[index];
        }
        return `Día ${index + 1}`;
    }

    loadItem(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                // Patch basic fields
                this.form.patchValue({
                    name: data.name,
                    description: data.description,
                    scheduleType: data.scheduleType,
                    cycleLengthDays: data.cycleLengthDays,
                    toleranceMinutes: data.toleranceMinutes,
                    maxWeeklyHours: data.maxWeeklyHours,
                    color: data.color,
                    active: data.active
                });

                // Update Max Hours Signal
                this.maxHoursSignal.set(data.maxWeeklyHours || 46);

                // Rebuild days with loaded data
                this.initializeDays();

                if (data.days) {
                    data.days.forEach((day, index) => {
                        if (index < this.daysArray.length) {
                            const dayGroup = this.daysArray.at(index);

                            // Patch legacy fields
                            dayGroup.patchValue({
                                isRestDay: day.isRestDay,
                                startTime: this.parseTimeToDate(day.startTime),
                                endTime: this.parseTimeToDate(day.endTime),
                                isNextDay: day.isNextDay,
                                breakMinutes: day.breakMinutes
                            });

                            // Load Time Slots if present
                            if (day.timeSlots && day.timeSlots.length > 0) {
                                const slotsArray = dayGroup.get('timeSlots') as FormArray;
                                slotsArray.clear(); // Ensure clean slate

                                day.timeSlots.forEach(slot => {
                                    const slotGroup = this.createTimeSlotGroup(slot.startTime, slot.endTime);
                                    slotGroup.patchValue({
                                        slotOrder: slot.slotOrder,
                                        isNextDay: slot.isNextDay,
                                        breakMinutes: slot.breakMinutes
                                    });
                                    slotsArray.push(slotGroup);
                                });
                            }

                            this.onRestDayChange(index, day.isRestDay);
                        }
                    });
                }

                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar la información.');
                this.loading.set(false);
                setTimeout(() => this.router.navigate(['/rrhh/work-schedules']), 1500);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        const data: WorkSchedule = this.form.getRawValue();

        const payload = {
            ...this.form.value,
            days: this.form.value.days.map((day: any) => ({
                ...day,
                startTime: this.formatTimeToString(day.startTime),
                endTime: this.formatTimeToString(day.endTime),
                timeSlots: day.timeSlots?.map((slot: any) => ({
                    ...slot,
                    startTime: this.formatTimeToString(slot.startTime || ''),
                    endTime: this.formatTimeToString(slot.endTime || '')
                })) || []
            }))
        };

        const request = this.isEditMode()
            ? this.service.update(this.itemId()!, payload)
            : this.service.create(payload);

        request.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/work-schedules']);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || (this.isEditMode()
                    ? 'Error al actualizar el horario laboral.'
                    : 'Error al crear el horario laboral.'));
            }
        });
    }
}
