import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    active: boolean;
    parentId?: string;
    parentName?: string;
    costCenterId?: string;
    costCenterName?: string;
    organizationalLevelId?: string;
    organizationalLevelName?: string;
    managerPositionId?: string;
    locationIds?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/departments`;

    getAll(): Observable<Department[]> {
        return this.http.get<Department[]>(this.apiUrl);
    }

    getActive(): Observable<Department[]> {
        return this.http.get<Department[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<Department> {
        return this.http.get<Department>(`${this.apiUrl}/${id}`);
    }

    create(department: Partial<Department>): Observable<Department> {
        return this.http.post<Department>(this.apiUrl, department);
    }

    update(id: string, department: Partial<Department>): Observable<Department> {
        return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
