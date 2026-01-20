import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OptionDto {
    id: string;
    name: string;
}

export enum CompensationCategory {
    EARNING = 'EARNING',
    DEDUCTION = 'DEDUCTION'
}

export interface CompensationType {
    id?: string;
    name: string;
    code?: string;
    description?: string;

    category: CompensationCategory;
    categoryLabel?: string;

    isSalary: boolean;
    isTaxable: boolean;
    isVariable: boolean;
    isReadOnly: boolean;
    active: boolean;

    costCenterId?: string;
    costCenterName?: string;

    currencyId?: string;
    currencyCode?: string;

    periodicityId?: string;
    periodicityName?: string;

    calculationBaseId?: string;
    calculationBaseName?: string;

    fixedAmount?: number;
    percentage?: number;
    targetValue?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompensationTypeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/compensation-types`;

    getAll(): Observable<CompensationType[]> {
        return this.http.get<CompensationType[]>(this.apiUrl);
    }

    getActive(): Observable<CompensationType[]> {
        return this.http.get<CompensationType[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<CompensationType> {
        return this.http.get<CompensationType>(`${this.apiUrl}/${id}`);
    }

    create(data: CompensationType): Observable<CompensationType> {
        return this.http.post<CompensationType>(this.apiUrl, data);
    }

    update(id: string, data: CompensationType): Observable<CompensationType> {
        return this.http.put<CompensationType>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Options
    getPeriodicityOptions(): Observable<OptionDto[]> {
        return this.http.get<OptionDto[]>(`${this.apiUrl}/options/periodicities`);
    }

    getCalculationBaseOptions(): Observable<OptionDto[]> {
        return this.http.get<OptionDto[]>(`${this.apiUrl}/options/calculation-bases`);
    }
}
