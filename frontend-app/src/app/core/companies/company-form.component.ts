import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Textarea } from 'primeng/textarea';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AddressBuilderComponent } from '../../shared/components/address-builder/address-builder.component';
import { CompanyService, Company, CompanyWebsite } from '../services/company.service';
import { EconomicSectorService, EconomicSector } from '../services/economic-sector.service';
import { EntityTypeService, EntityType } from '../services/entity-type.service';

import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-company-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputText, Select, ToggleSwitch,
        IconComponent, AlertComponent, AddressBuilderComponent, Textarea
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">

        <!-- Alerts -->
        <app-alert *ngIf="successMessage()" type="success" [message]="successMessage()" (closed)="successMessage.set(null)"></app-alert>
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" (closed)="errorMessage.set(null)"></app-alert>

        <!-- Header Section -->
        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Administración</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nueva' }} <span class="bg-clip-text text-transparent" [style.backgroundImage]="'linear-gradient(to right, var(--primary), var(--primary-stop))'">Empresa</span>
                    </h1>
                </div>
                <button [routerLink]="['/core/companies']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon icon="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Registra la información corporativa, ubicación geográfica y parámetros operativos de la empresa para habilitar sus servicios en la plataforma.
            </p>
        </div>

        <!-- Wizard Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                
                <!-- Premium Step Indicator -->
                <div class="p-8 pb-4">
                    <div class="flex items-center justify-between relative px-2 sm:px-8">
                        <!-- Background Track -->
                        <div class="absolute top-[34px] left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/5 -z-0 mx-12 sm:mx-20">
                            <!-- Progress Line -->
                            <div class="h-full transition-all duration-700 ease-out shadow-lg" 
                                 [style.background]="'linear-gradient(to right, var(--primary), var(--primary-stop))'"
                                 [style.boxShadow]="'0 0 15px var(--primary-light)'"
                                 [style.width]="(currentStep() / 3 * 100) + '%'"></div>
                        </div>

                        <!-- Step Nodes -->
                        <ng-container *ngFor="let step of ['Identidad', 'Contacto', 'Ubicación', 'Branding']; let i = index">
                            <div class="flex flex-col items-center gap-4 relative z-10 group">
                                <!-- Outer Container -->
                                <div [class]="currentStep() === i ? 'bg-white dark:bg-slate-900 ring-4 ring-primary/10' : (currentStep() > i ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950/40')"
                                     class="p-1.5 rounded-[1.25rem] transition-all duration-500 border border-slate-200 dark:border-white/5">
                                    
                                    <!-- Inner Container -->
                                    <div [class]="currentStep() === i ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : (currentStep() > i ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-transparent text-slate-400 dark:text-slate-700 border border-slate-200 dark:border-white/10')"
                                         class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500">
                                        
                                        <app-icon *ngIf="currentStep() > i" icon="check" class="w-6 h-6 stroke-[3]"></app-icon>
                                        <span *ngIf="currentStep() <= i">{{ i + 1 }}</span>
                                    </div>
                                </div>
                                
                                <!-- Label -->
                                <span [class]="currentStep() === i ? 'text-primary' : (currentStep() > i ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-700')"
                                      class="text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500">
                                    {{ step }}
                                </span>
                            </div>
                        </ng-container>

                    </div>
                </div>

                <div class="p-8 md:p-12 pt-8">
                    <form [formGroup]="form">
                        
                        <!-- STEP 1: Identidad -->
                        <div *ngIf="currentStep() === 0" class="animate-fade-in space-y-8">
                            <div class="text-center mb-10">
                                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Identidad Corporativa</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Información legal y fiscal de la empresa</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- NIT -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NIT / Tax ID *</label>
                                    <div class="relative group">
                                        <app-icon icon="hash" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="nit" placeholder="900123456-7" 
                                               style="padding-left: 3.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>

                                <!-- Razón Social -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Razón Social</label>
                                    <div class="relative group">
                                        <app-icon icon="building" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="legalName" placeholder="Empresa S.A.S." 
                                               style="padding-left: 3.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>

                                <!-- Nombre Comercial -->
                                <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial *</label>
                                    <div class="relative group">
                                        <app-icon icon="briefcase" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="name" placeholder="Mi Empresa" 
                                               style="padding-left: 3.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                    <small class="text-[10px] text-slate-400 ml-1">Nombre con el que se conoce la empresa</small>
                                </div>

                                <!-- Tipo de Entidad (Autocomplete) -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo de Entidad</label>
                                    <p-select [options]="entityTypes()" optionLabel="name" optionValue="id" formControlName="entityTypeId" 
                                              [filter]="true" filterBy="name"
                                              placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>
                                
                                <!-- Sector Económico -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sector Económico</label>
                                    <p-select [options]="economicSectors()" optionLabel="name" optionValue="id" formControlName="sectorId" 
                                              [filter]="true" filterBy="name"
                                              placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>

                                <!-- Descripción (TextArea) -->
                                <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                                    <textarea pTextarea formControlName="description" rows="5" placeholder="Breve descripción de la empresa..."
                                              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                                </div>

                            </div>
                        </div>

                        <!-- STEP 2: Contacto -->
                        <div *ngIf="currentStep() === 1" class="animate-fade-in space-y-8">
                            <div class="text-center mb-10">
                                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Información de Contacto</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Medios de comunicación institucional</p>
                            </div>

                            <div class="grid grid-cols-1 gap-6">
                                <!-- Email Institucional -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Institucional</label>
                                    <div class="relative group">
                                        <app-icon icon="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="notificationEmail" type="email" placeholder="admin@miempresa.com" 
                                               style="padding-left: 3.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>

                                <!-- Teléfono Principal y Extensión -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    
                                    <!-- Extensión (Autocomplete) -->
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Indicativo</label>
                                        <p-select [options]="countries()" optionLabel="label" optionValue="phoneCode" formControlName="phoneExtension" 
                                              [filter]="true" filterBy="label"
                                              placeholder="+57" class="w-full" styleClass="w-full" appendTo="body">
                                            <ng-template let-country pTemplate="item">
                                                <div class="flex align-items-center gap-2">
                                                    <span>{{ country.label }}</span>
                                                </div>
                                            </ng-template>
                                            <ng-template let-country pTemplate="selectedItem">
                                                <div class="flex align-items-center gap-2" *ngIf="country">
                                                    <span>{{ country.phoneCode }}</span>
                                                </div>
                                            </ng-template>
                                        </p-select>
                                    </div>

                                    <div class="md:col-span-2 flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Teléfono / Conmutador</label>
                                        <div class="relative group">
                                            <app-icon icon="phone" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                            <input pInputText formControlName="mainPhone" placeholder="300 123 4567" 
                                                   style="padding-left: 3.5rem !important;"
                                                   class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                        </div>
                                    </div>
                                </div>

                                <!-- Sitios Web (Dinámico) -->
                                <div class="flex flex-col gap-4">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sitios Web</label>
                                    <div formArrayName="websites" class="space-y-3">
                                        <div *ngFor="let website of websitesArray.controls; let i = index" [formGroupName]="i" class="flex gap-2">
                                            <div class="flex-1 relative group">
                                                <app-icon icon="globe" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                                <input pInputText formControlName="url" placeholder="https://www.miempresa.com" 
                                                       style="padding-left: 3.5rem !important;"
                                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                            </div>
                                            <button type="button" (click)="removeWebsite(i)" class="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                                                <app-icon icon="trash" class="w-5 h-5"></app-icon>
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" (click)="addWebsite()" class="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                                        <app-icon icon="plus" class="w-4 h-4"></app-icon>
                                        Agregar Sitio Web
                                    </button>
                                </div>

                                <!-- Dominio Permitido -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dominio Permitido</label>
                                    <div class="relative group">
                                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                                        <input pInputText formControlName="allowedDomain" placeholder="miempresa.com" 
                                               style="padding-left: 2.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                    <small class="text-[10px] text-slate-400 ml-1">Solo usuarios con este dominio podrán registrarse</small>
                                </div>
                            </div>
                        </div>

                        <!-- STEP 3: Ubicación y Estado -->
                        <div *ngIf="currentStep() === 2" class="animate-fade-in space-y-8">
                            <div class="text-center mb-10">
                                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Ubicación y Estado</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Dirección física y configuración operativa</p>
                            </div>

                            <div class="space-y-6">
                                <!-- Dirección -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dirección Principal</label>
                                    <div class="flex gap-3 w-full">
                                        <input pInputText formControlName="streetAddress" class="flex-1 w-full cursor-pointer hover:border-primary/50" readonly (click)="openAddressBuilder()" placeholder="Haz clic para construir dirección...">
                                        <button type="button" (click)="openAddressBuilder()" class="p-[10px] w-12 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-primary transition-all active:scale-90 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                            <app-icon icon="edit" class="w-5 h-5"></app-icon>
                                        </button>
                                    </div>
                                </div>

                                <!-- Geografía y Código Postal -->
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div class="flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">País</label>
                                        <p-select [options]="countries()" optionLabel="name" optionValue="id" formControlName="countryId" 
                                                  [filter]="true" filterBy="name"
                                                  placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                                        <p-select [options]="states()" optionLabel="name" optionValue="id" formControlName="stateId" 
                                                  [filter]="true" filterBy="name"
                                                  placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ciudad</label>
                                        <p-select [options]="cities()" optionLabel="name" optionValue="id" formControlName="cityId" 
                                                  [filter]="true" filterBy="name"
                                                  placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código Postal</label>
                                        <input pInputText formControlName="postalCode" placeholder="110111" 
                                               class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>

                                <!-- Estado Operativo -->
                                <div *ngIf="isSuperAdminGlobal()" class="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h3 class="font-black text-slate-800 dark:text-white text-sm mb-1">Estado Operativo</h3>
                                            <p class="text-xs text-slate-500 dark:text-slate-400">Controla el acceso de todos los usuarios de esta empresa</p>
                                        </div>
                                        <p-toggleswitch formControlName="status"></p-toggleswitch>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- STEP 4: Branding -->
                        <div *ngIf="currentStep() === 3" class="animate-fade-in space-y-8">
                            <div class="text-center mb-10">
                                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Branding Corporativo</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Personaliza la identidad visual de la empresa</p>
                            </div>

                            <div class="space-y-6">
                                <!-- Logo Upload (Full Width) -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Logo de la Empresa</label>
                                    
                                    <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept="image/*">
                                    
                                    <div (click)="fileInput.click()" 
                                         class="w-full rounded-3xl bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer group flex flex-col items-center justify-center p-12 gap-4 relative overflow-hidden">
                                        
                                        <!-- Preview Overlay -->
                                        <div *ngIf="logoPreview()" class="absolute inset-0 z-0">
                                            <img [src]="logoPreview()" class="w-full h-full object-contain opacity-20 blur-sm">
                                        </div>

                                        <div class="relative z-10 flex flex-col items-center gap-4">
                                            <div *ngIf="!logoPreview()" class="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                                                <app-icon icon="upload" class="w-8 h-8"></app-icon>
                                            </div>
                                            
                                            <div *ngIf="logoPreview()" class="w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center p-2 group-hover:scale-105 transition-all duration-300">
                                                <img [src]="logoPreview()" class="max-w-full max-h-full object-contain">
                                            </div>

                                            <div class="text-center">
                                                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {{ logoPreview() ? 'Haz clic para cambiar el logo' : 'Haz clic para subir o arrastra tu logo aquí' }}
                                                </p>
                                                <p class="text-xs text-slate-400 mt-1">SVG, PNG, JPG (máx. 2MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <!-- Color Primario -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Color Primario de Marca</label>
                                    <div class="flex items-center gap-4">
                                        
                                        <!-- Color Preview Rounded -->
                                        <div class="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105 active:scale-95">
                                            <input type="color" formControlName="primaryColor" 
                                                   class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer">
                                        </div>

                                        <div class="flex-1">
                                            <input pInputText formControlName="primaryColor" placeholder="#4F46E5" 
                                                   class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                            <p class="text-xs text-slate-400 mt-2">Formato hexadecimal (#RRGGBB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>

                    <!-- Navigation -->
                    <div class="flex items-center justify-between mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button *ngIf="currentStep() > 0" (click)="previousStep()" 
                                class="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            <app-icon icon="arrow-left" class="w-4 h-4"></app-icon>
                            Anterior
                        </button>
                        <div *ngIf="currentStep() === 0"></div>

                        <button *ngIf="currentStep() < 3" (click)="nextStep()" 
                                class="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30 ml-auto">
                            Siguiente
                            <app-icon icon="arrow-right" class="w-4 h-4"></app-icon>
                        </button>

                        <button *ngIf="currentStep() === 3" (click)="onSubmit()" [disabled]="loading()"
                                class="flex items-center gap-2 px-8 py-3 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg ml-auto"
                                [style.background]="'linear-gradient(to right, var(--primary), var(--primary-dark))'"
                                [style.boxShadow]="'0 10px 15px -3px var(--primary-light)'">
                            <app-icon *ngIf="!loading()" icon="check" class="w-4 h-4"></app-icon>
                            <span *ngIf="!loading()">{{ isEditMode() ? 'Actualizar Empresa' : 'Crear Empresa' }}</span>
                            <span *ngIf="loading()">Procesando...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Address Builder Component -->
        <app-address-builder
            [(visible)]="showAddressBuilder"
            (onConfirm)="handleAddressConfirm($event)">
        </app-address-builder>
    </div>
    `
})
export class CompanyFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private companyService = inject(CompanyService);
    private entityTypeService = inject(EntityTypeService);
    private economicSectorService = inject(EconomicSectorService);
    private profileService = inject(ProfileService);
    private authService = inject(AuthService);

    isSuperAdminGlobal(): boolean {
        return this.authService.currentUser()?.isSuperAdmin ?? false;
    }

    currentStep = signal(0);
    isEditMode = signal(false);
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    showAddressBuilder = false;

    logoPreview = signal<string | null>(null);
    selectedFile: File | null = null;


    entityTypes = signal<EntityType[]>([]);
    economicSectors = signal<EconomicSector[]>([]);
    countries = signal<any[]>([]);
    states = signal<any[]>([]);
    cities = signal<any[]>([]);

    form!: FormGroup;
    companyId?: string;

    get websitesArray(): FormArray {
        return this.form.get('websites') as FormArray;
    }

    ngOnInit() {
        this.initForm();
        this.loadInitialData();
        this.setupGeographyWatchers();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.companyId = params['id'];
                this.isEditMode.set(true);
                this.loadCompany(params['id']);
            }
        });
    }

    private initForm() {
        this.form = this.fb.group({
            // Step 1: Identidad
            nit: ['', Validators.required],
            legalName: [''],
            name: ['', Validators.required], // Nombre Comercial
            entityTypeId: [''],
            sectorId: [''],
            description: [''],


            // Step 2: Contacto
            notificationEmail: ['', [Validators.email]],
            mainPhone: [''],
            phoneExtension: [''],
            websites: this.fb.array([]),
            allowedDomain: [''],

            // Step 3: Ubicación y Estado
            streetAddress: [''],
            countryId: [''],
            stateId: [''],
            cityId: [''],
            postalCode: [''],
            status: [true],

            // Step 4: Branding
            logoUrl: [''],
            primaryColor: ['#4F46E5']
        });
    }

    private loadInitialData() {
        this.entityTypeService.getAll().subscribe(data => this.entityTypes.set(data));
        this.economicSectorService.getAll().subscribe(data => this.economicSectors.set(data));
        this.profileService.getCountries().subscribe(data => {
            // Transform data for formatting
            const formatted = data.map((c: any) => ({
                ...c,
                label: `${c.phoneCode} - ${c.name}`
            }));
            this.countries.set(formatted);
        });
    }


    private setupGeographyWatchers() {
        this.form.get('countryId')?.valueChanges.subscribe(countryId => {
            if (!countryId) {
                this.states.set([]);
                this.cities.set([]);
                return;
            }
            this.loadStates(countryId);
        });

        this.form.get('stateId')?.valueChanges.subscribe(stateId => {
            if (!stateId) {
                this.cities.set([]);
                return;
            }
            this.loadCities(stateId);
        });
    }

    private loadStates(countryId: string) {
        this.profileService.getStates(countryId).subscribe(data => this.states.set(data));
    }

    private loadCities(stateId: string) {
        this.profileService.getCities(stateId).subscribe(data => this.cities.set(data));
    }

    private loadCompany(id: string) {
        this.companyService.getById(id).subscribe({
            next: (data) => {
                if (data.countryId) {
                    this.loadStates(data.countryId);
                    if (data.stateId) {
                        this.loadCities(data.stateId);
                    }
                }

                // Load websites
                if (data.websites && data.websites.length > 0) {
                    data.websites.forEach(w => this.addWebsite(w));
                }

                if (data.logoUrl) {
                    this.logoPreview.set(data.logoUrl);
                }

                this.form.patchValue({

                    nit: data.nit,
                    legalName: data.legalName,
                    name: data.name,
                    entityTypeId: data.entityTypeId,
                    sectorId: data.sectorId,
                    description: data.description,

                    notificationEmail: data.notificationEmail,
                    mainPhone: data.mainPhone,
                    phoneExtension: data.phoneExtension,
                    allowedDomain: data.allowedDomain,
                    streetAddress: data.streetAddress,
                    countryId: data.countryId,
                    stateId: data.stateId,
                    cityId: data.cityId,
                    postalCode: data.postalCode,
                    status: data.status,
                    logoUrl: data.logoUrl,
                    primaryColor: data.primaryColor || '#4F46E5'
                });
            },
            error: () => this.showError('Error al cargar la empresa')
        });
    }

    addWebsite(website?: CompanyWebsite) {
        const websiteGroup = this.fb.group({
            url: [website?.url || '', Validators.required],
            isPrimary: [website?.isPrimary || false],
            description: [website?.description || '']
        });
        this.websitesArray.push(websiteGroup);
    }

    removeWebsite(index: number) {
        this.websitesArray.removeAt(index);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validation: Only images
            if (!file.type.startsWith('image/')) {
                this.showError('El archivo seleccionado no es una imagen válida.');
                this.selectedFile = null;
                this.logoPreview.set(null);
                return;
            }

            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.logoPreview.set(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }


    nextStep() {

        if (this.currentStep() < 3) {
            this.currentStep.update(v => v + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep() {
        if (this.currentStep() > 0) {
            this.currentStep.update(v => v - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    openAddressBuilder() {
        this.showAddressBuilder = true;
    }

    handleAddressConfirm(address: string) {
        this.form.get('streetAddress')?.setValue(address);
    }

    onSubmit() {
        if (this.form.invalid) {
            this.showError('Por favor completa los campos requeridos');
            return;
        }

        this.loading.set(true);
        const formData: Company = this.form.value;

        const operation = this.isEditMode()
            ? this.companyService.update(this.companyId!, formData)
            : this.companyService.create(formData);

        operation.subscribe({
            next: (savedCompany) => {
                const companyId = this.isEditMode() ? this.companyId! : savedCompany.id!;

                if (this.selectedFile) {
                    this.companyService.uploadLogo(companyId, this.selectedFile).subscribe({
                        next: (uploadRes) => {
                            // Update company with new logo URL
                            const updateData = { ...formData, logoUrl: uploadRes.url, id: companyId };
                            this.companyService.update(companyId, updateData).subscribe({
                                next: () => this.finalizeSubmit(),
                                error: () => this.finalizeSubmit() // Finalize anyway even if update fails
                            });
                        },
                        error: (err) => {
                            this.loading.set(false);
                            this.showError('Empresa guardada, pero hubo un error al subir el logo: ' + (err?.error?.message || 'Error desconocido'));
                        }
                    });
                } else {
                    this.finalizeSubmit();
                }
            },
            error: (err) => {
                this.loading.set(false);
                const msg = err?.error?.message || 'Error al guardar la empresa';
                this.showError(msg);
            }
        });
    }

    private finalizeSubmit() {
        this.loading.set(false);
        this.showSuccess(this.isEditMode() ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente');
        setTimeout(() => this.router.navigate(['/core/companies']), 1500);
    }


    private showSuccess(msg: string) {
        this.successMessage.set(msg);
        this.errorMessage.set(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private showError(msg: string) {
        this.errorMessage.set(msg);
        this.successMessage.set(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}