import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Relationship {
    id: string;
    code: string;
    name: string;
    description: string;
    isFamily: boolean;
    active: boolean;
}

export interface EducationLevel {
    id: string;
    name: string;
}

export interface MaritalStatus {
    id: string;
    code: string;
    name: string;
}

export interface BloodType {
    id: string;
    name: string;
}

export interface RhFactor {
    id: string;
    name: string;
}

export interface ExperienceRange {
    id: string;
    code: string;
    name: string;
}

export interface Occupation {
    id: string;
    code: string;
    name: string;
    description: string;
    category: string;
    active: boolean;
}

export interface ContractType {
    id: string;
    name: string;
    hasEndDate: boolean;
    defaultDuration?: number;
    durationUnit?: string;
}

export interface WorkSchedule {
    id: string;
    name: string;
}

export interface DocumentType {
    id: string;
    name: string;
    code: string;
    isRequired: boolean;
    requiresExpiration: boolean;
}

export interface CostCenter {
    id: string;
    code: string;
    name: string;
    description?: string;
    currencyId?: string;
    currencyCode?: string;
    transportAidThreshold?: number;
    active: boolean;
}

export interface Department {
    id: string;
    code: string;
    name: string;
    costCenterId?: string;
    locationIds?: string[];
    active: boolean;
}

export interface Location {
    id: string;
    name: string;
    address?: string;
    city?: string;
    department?: string;
    country?: string;
    isMain: boolean;
    active: boolean;
}

export interface OperationalCenter {
    id: string;
    code: string;
    name: string;
    locationId?: string;
    active: boolean;
}

export interface Position {
    id: string;
    code: string;
    name: string;
    departmentId: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/catalogs`;

    getRelationships(isFamily?: boolean): Observable<Relationship[]> {
        const params: any = {};
        if (isFamily !== undefined) params.isFamily = isFamily;
        return this.http.get<Relationship[]>(`${this.apiUrl}/relationships`, { params });
    }

    getOccupations(category?: string): Observable<Occupation[]> {
        const params: any = {};
        if (category) params.category = category;
        return this.http.get<Occupation[]>(`${this.apiUrl}/occupations`, { params });
    }

    getEducationLevels(): Observable<EducationLevel[]> {
        return this.http.get<EducationLevel[]>(`${this.apiUrl}/education-levels`);
    }

    getMaritalStatuses(): Observable<MaritalStatus[]> {
        return this.http.get<MaritalStatus[]>(`${this.apiUrl}/marital-statuses`);
    }

    getBloodTypes(): Observable<BloodType[]> {
        return this.http.get<BloodType[]>(`${this.apiUrl}/blood-types`);
    }

    getRhFactors(): Observable<RhFactor[]> {
        return this.http.get<RhFactor[]>(`${this.apiUrl}/rh-factors`);
    }

    getExperienceRanges(): Observable<ExperienceRange[]> {
        return this.http.get<ExperienceRange[]>(`${this.apiUrl}/experience-ranges`);
    }

    getOccupationsGrouped(): Observable<Record<string, Occupation[]>> {
        return this.http.get<Record<string, Occupation[]>>(`${this.apiUrl}/occupations/grouped`);
    }

    getContractTypes(): Observable<ContractType[]> {
        return this.http.get<ContractType[]>(`${this.apiUrl}/contract-types`);
    }

    getWorkSchedules(): Observable<WorkSchedule[]> {
        return this.http.get<WorkSchedule[]>(`${this.apiUrl}/work-schedules`);
    }

    getHRDocumentTypes(): Observable<DocumentType[]> {
        return this.http.get<DocumentType[]>(`${this.apiUrl}/document-types/hr`);
    }

    getCostCenters(): Observable<CostCenter[]> {
        return this.http.get<CostCenter[]>(`${this.apiUrl}/cost-centers`);
    }

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(`${this.apiUrl}/departments`);
    }

    getLocations(): Observable<Location[]> {
        return this.http.get<Location[]>(`${this.apiUrl}/locations`);
    }

    getOperationalCenters(): Observable<OperationalCenter[]> {
        return this.http.get<OperationalCenter[]>(`${this.apiUrl}/operational-centers`);
    }

    getPositions(): Observable<Position[]> {
        return this.http.get<Position[]>(`${this.apiUrl}/positions`);
    }
}
