import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ContractType {
    id?: string;
    name: string;
    description?: string;
    hasEndDate: boolean;
    defaultDuration?: number;
    durationUnit?: 'DAYS' | 'MONTHS' | 'YEARS';
    active?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ContractTypeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/contract-types`;

    getAll(): Observable<ContractType[]> {
        return this.http.get<ContractType[]>(this.apiUrl);
    }

    getAllActive(): Observable<ContractType[]> {
        return this.http.get<ContractType[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<ContractType> {
        return this.http.get<ContractType>(`${this.apiUrl}/${id}`);
    }

    create(contractType: ContractType): Observable<ContractType> {
        return this.http.post<ContractType>(this.apiUrl, contractType);
    }

    update(id: string, contractType: ContractType): Observable<ContractType> {
        return this.http.put<ContractType>(`${this.apiUrl}/${id}`, contractType);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleActive(id: string): Observable<ContractType> {
        return this.http.patch<ContractType>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
