import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface Permission {
    id: string;
    name: string;
    displayName: string;
    description: string;
    moduleName: string;
    resourceName: string;
    category: string;
    categoryDescription: string;
    categoryIcon: string;
    actionType: string;
    isSystem: boolean;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystemRole: boolean;
    active: boolean;
    createdAt?: string;
    permissionCount?: number;
}

export interface PermissionsGrouped {
    [moduleName: string]: {
        [resourceName: string]: Permission[];
    };
}

export interface RoleDetail {
    role: Role;
    assignedPermissionIds: string[];
}

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/management/roles`;

    getAll(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }

    getById(id: string): Observable<RoleDetail> {
        return this.http.get<RoleDetail>(`${this.apiUrl}/${id}`);
    }

    getPermissionsGrouped(): Observable<PermissionsGrouped> {
        return this.http.get<PermissionsGrouped>(`${this.apiUrl}/permissions/grouped`);
    }

    create(data: { name: string; description?: string; permissionIds: string[] }): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, data);
    }

    update(id: string, data: { name: string; description?: string; permissionIds: string[] }): Observable<Role> {
        return this.http.put<Role>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<Role> {
        return this.http.patch<Role>(`${this.apiUrl}/${id}/toggle`, {});
    }
}
