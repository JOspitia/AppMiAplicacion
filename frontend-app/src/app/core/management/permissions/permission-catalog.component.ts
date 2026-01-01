import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { IconComponent } from '../../../shared/components/icon.component';
import { RoleManagementService, PermissionsGrouped, Permission } from '../../services/role-management.service';

@Component({
    selector: 'app-permission-catalog',
    standalone: true,
    imports: [
        CommonModule, RouterModule, TableModule, ButtonModule,
        InputTextModule, TooltipModule, TagModule, AccordionModule,
        IconComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Administración</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Catálogo de <span class="text-primary">Permisos</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Explora el diccionario completo de capacidades y accesos del sistema.</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="relative group">
                    <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                    <input pInputText type="text" 
                           (input)="searchTerm.set($any($event.target).value)" 
                           placeholder="Buscar permiso..." 
                           style="padding-left: 3.5rem !important;"
                           class="w-full md:w-80 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                </div>
            </div>
        </div>

        <!-- Grouped Content -->
        <div class="space-y-6">
            <div *ngFor="let module of filteredModules()" class="animate-fade-in-up">
                <div class="flex items-center gap-3 mb-4 mt-6">
                    <div class="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                        <app-icon name="box" size="20"></app-icon>
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ module.name }}</h2>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Módulo de Plataforma</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-6">
                    <div *ngFor="let category of module.categories" class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden p-6 transition-all hover:shadow-2xl">
                        
                        <div class="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <app-icon [name]="category.icon" size="18"></app-icon>
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-800 dark:text-slate-200">{{ category.name }}</h3>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400" *ngIf="category.description">{{ category.description }}</p>
                                </div>
                            </div>
                            <p-tag [value]="category.permissions.length + ' permisos'" severity="secondary" [rounded]="true"></p-tag>
                        </div>

                        <p-table [value]="category.permissions" styleClass="p-datatable-sm" [tableStyle]="{ 'min-width': '50rem' }">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="width:30%">Permiso / Código</th>
                                    <th style="width:50%">Descripción del Acceso</th>
                                    <th style="width:10%" class="text-center">Tipo</th>
                                    <th style="width:10%" class="text-center">Alcance</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-perm>
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-all">
                                    <td class="py-4">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ perm.displayName }}</span>
                                            <code class="text-[9px] font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit mt-1">
                                                {{ perm.name }}
                                            </code>
                                        </div>
                                    </td>
                                    <td class="py-4">
                                        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{{ perm.description || 'Sin descripción disponible.' }}</p>
                                    </td>
                                    <td class="py-4 text-center">
                                        <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                                              [ngClass]="getActionClass(perm.actionType)">
                                            {{ perm.actionType }}
                                        </span>
                                    </td>
                                    <td class="py-4 text-center">
                                        <span *ngIf="perm.isSystem" 
                                              pTooltip="Este permiso es transversal a la plataforma"
                                              class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                            SISTEMA
                                        </span>
                                        <span *ngIf="!perm.isSystem" 
                                              pTooltip="Permiso exclusivo de la compañía"
                                              class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                            TENANT
                                        </span>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredModules().length === 0" class="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div class="h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6 border border-slate-100 dark:border-slate-700">
                <app-icon name="search" size="40"></app-icon>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white">No se encontraron permisos</h3>
            <p class="text-slate-500">Prueba con otros términos de búsqueda.</p>
        </div>
    </div>
    `
})
export class PermissionCatalogComponent implements OnInit {
    private roleService = inject(RoleManagementService);

    searchTerm = signal('');
    groupedData = signal<PermissionsGrouped | null>(null);

    // Computed property to transform the nested object into a flattened structure for easy iteration and filtering
    filteredModules = computed(() => {
        const data = this.groupedData();
        if (!data) return [];

        const term = this.searchTerm().toLowerCase();
        const modules: any[] = [];

        Object.keys(data).forEach(moduleName => {
            const categories: any[] = [];
            const moduleCategories = data[moduleName];

            Object.keys(moduleCategories).forEach(catName => {
                const permissions = moduleCategories[catName].filter(p =>
                    p.name.toLowerCase().includes(term) ||
                    p.displayName?.toLowerCase().includes(term) ||
                    p.description?.toLowerCase().includes(term)
                );

                if (permissions.length > 0) {
                    // Extract category metadata from the first permission
                    const firstPerm = permissions[0];
                    categories.push({
                        name: catName,
                        description: firstPerm.categoryDescription,
                        icon: firstPerm.categoryIcon || 'layers',
                        permissions: permissions
                    });
                }
            });

            if (categories.length > 0) {
                modules.push({
                    name: moduleName,
                    categories: categories
                });
            }
        });

        return modules;
    });

    ngOnInit() {
        this.roleService.getPermissionsGrouped().subscribe({
            next: (data) => this.groupedData.set(data),
            error: (err) => console.error('Error fetching permissions catalog', err)
        });
    }

    getActionClass(action: string): string {
        switch (action?.toUpperCase()) {
            case 'VIEW': return 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
            case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'EDIT': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        }
    }
}
