import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Role {
    id: string;
    name: string;
    description: string;
    active: boolean;
    isSystemRole: boolean;
    isAdminRole?: boolean;
    isRootRole?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/management/roles`;

    getAll(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }
}
