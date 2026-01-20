import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CostCenter {
    id?: string;
    code: string;
    name: string;
    budget?: number;
    currencyId?: string;
    currencyCode?: string;
    currencySymbol?: string;
    transportAidThreshold?: number;
    description?: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CostCenterService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/cost-centers`;

    getAll(active?: boolean): Observable<CostCenter[]> {
        let params: any = {};
        if (active !== undefined) {
            params.active = active.toString();
        }
        return this.http.get<CostCenter[]>(this.apiUrl, { params });
    }

    getActive(): Observable<CostCenter[]> {
        return this.getAll(true);
    }

    getById(id: string): Observable<CostCenter> {
        return this.http.get<CostCenter>(`${this.apiUrl}/${id}`);
    }

    create(costCenter: CostCenter): Observable<CostCenter> {
        return this.http.post<CostCenter>(this.apiUrl, costCenter);
    }

    update(id: string, costCenter: CostCenter): Observable<CostCenter> {
        return this.http.put<CostCenter>(`${this.apiUrl}/${id}`, costCenter);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }
}
