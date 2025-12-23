import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Bienvenido al panel de control de tu empresa</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:border-primary/50 transition-all">
            <i class="pi pi-calendar mr-2"></i>Últimos 30 días
          </button>
          <button class="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all">
            <i class="pi pi-download mr-2"></i>Exportar
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Stat Card 1 -->
        <div class="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-primary/30 transition-all overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <i class="pi pi-users text-xl text-primary"></i>
              </div>
              <span class="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">+12%</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white">1,248</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Empleados Activos</p>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div class="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <i class="pi pi-building text-xl text-indigo-500"></i>
              </div>
              <span class="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">+3</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white">24</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Departamentos</p>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div class="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-all overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <i class="pi pi-clock text-xl text-amber-500"></i>
              </div>
              <span class="px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold">-5%</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white">156</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Horas Extra / Mes</p>
          </div>
        </div>

        <!-- Stat Card 4 -->
        <div class="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-all overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <i class="pi pi-chart-line text-xl text-emerald-500"></i>
              </div>
              <span class="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">98.5%</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white">98.5%</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Asistencia Mensual</p>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Resumen de Nómina</h2>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary">Mensual</button>
              <button class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Anual</button>
            </div>
          </div>
          <!-- Chart Placeholder -->
          <div class="h-64 bg-slate-100 dark:bg-slate-700/30 rounded-xl flex items-center justify-center">
            <p class="text-slate-400 dark:text-slate-500 font-medium">📊 Gráfico de Nómina</p>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Actividad Reciente</h2>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-user-plus text-emerald-500 text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold">María García</span> fue contratada</p>
                <p class="text-xs text-slate-400">Hace 2 horas</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-sync text-primary text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold">Nómina Diciembre</span> procesada</p>
                <p class="text-xs text-slate-400">Hace 5 horas</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-exclamation-triangle text-amber-500 text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold">3 contratos</span> por vencer</p>
                <p class="text-xs text-slate-400">Hace 1 día</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent { }
