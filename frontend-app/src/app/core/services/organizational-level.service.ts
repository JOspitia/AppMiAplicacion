import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface OrganizationalLevel {
    id?: string;
    name: string;
    description?: string;
    hierarchyOrder: number;
    active?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OrganizationalLevelService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/organizational-levels`;

    getAll(active?: boolean): Observable<OrganizationalLevel[]> {
        let url = this.apiUrl;
        if (active !== undefined) {
            url += `?active=${active}`;
        }
        return this.http.get<OrganizationalLevel[]>(url);
    }

    getById(id: string): Observable<OrganizationalLevel> {
        return this.http.get<OrganizationalLevel>(`${this.apiUrl}/${id}`);
    }

    create(data: OrganizationalLevel): Observable<OrganizationalLevel> {
        return this.http.post<OrganizationalLevel>(this.apiUrl, data);
    }

    update(id: string, data: OrganizationalLevel): Observable<OrganizationalLevel> {
        return this.http.put<OrganizationalLevel>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }

    reorder(ids: string[]): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/reorder`, ids);
    }
}
