import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
    id: string;
    name: string;
    description: string;
    active: boolean;
    isSystemRole: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private http = inject(HttpClient);
    private apiUrl = '/api/core/management/roles';

    getAll(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }
}
