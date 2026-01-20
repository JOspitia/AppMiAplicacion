import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OperationalCenter {
    id?: string;
    companyId?: string;
    code: string;
    name: string;
    description?: string;
    locationId?: string;
    locationName?: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OperationalCenterService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/operational-centers`;

    getAll(active?: boolean): Observable<OperationalCenter[]> {
        let params: any = {};
        if (active !== undefined) {
            params.active = active.toString();
        }
        return this.http.get<OperationalCenter[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<OperationalCenter> {
        return this.http.get<OperationalCenter>(`${this.apiUrl}/${id}`);
    }

    create(opCenter: OperationalCenter): Observable<OperationalCenter> {
        return this.http.post<OperationalCenter>(this.apiUrl, opCenter);
    }

    update(id: string, opCenter: OperationalCenter): Observable<OperationalCenter> {
        return this.http.put<OperationalCenter>(`${this.apiUrl}/${id}`, opCenter);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }
}
