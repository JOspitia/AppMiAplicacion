import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface ModuleDto {
    id: string;
    title: string;
    url: string;
    icon: string;
    description?: string;
    children: ModuleDto[];
    orderIndex: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);

    // Signal to store modules and share them across components
    modules = signal<ModuleDto[]>([]);
    loading = signal<boolean>(false);

    loadUserModules(): Observable<ModuleDto[]> {
        this.loading.set(true);
        return this.http.get<ModuleDto[]>('/api/dashboard/modules').pipe(
            tap(data => {
                this.modules.set(data);
                this.loading.set(false);
            })
        );
    }
}
