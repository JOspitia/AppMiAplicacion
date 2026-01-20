import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PositionFunction {
    id?: string;
    description: string;
    displayOrder?: number;
}

export interface PositionSkill {
    id?: string;
    skillName: string;
    skillLevelId?: string;
    skillLevelName?: string;
    isMandatory?: boolean;
    description?: string;
    displayOrder?: number;
}

export interface PositionRequirement {
    id?: string;
    requirementType: string; // EDUCATION, CERTIFICATION, LICENSE, OTHER
    description: string;
    isMandatory?: boolean;
    displayOrder?: number;
}

export interface PositionExperience {
    id?: string;
    area: string;
    minYears?: number;
    maxYears?: number;
    isMandatory?: boolean;
    description?: string;
    displayOrder?: number;
}

export interface Position {
    id?: string;
    name: string;
    code: string;
    description?: string;
    minSalary?: number;
    maxSalary?: number;
    riskLevel?: string;
    departmentId: string;
    departmentName?: string;
    departmentCode?: string;
    organizationalLevelId: string;
    organizationalLevelName?: string;
    currencyId?: string;
    currencyCode?: string;
    currencySymbol?: string;
    functions?: PositionFunction[];
    skills?: PositionSkill[];
    requirements?: PositionRequirement[];
    experiences?: PositionExperience[];
    active?: boolean;
}

export interface SkillLevel {
    id: string;
    name: string;
    code?: string;
    weight?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PositionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/positions`;

    getAll(): Observable<Position[]> {
        return this.http.get<Position[]>(this.apiUrl);
    }

    getActive(): Observable<Position[]> {
        return this.http.get<Position[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<Position> {
        return this.http.get<Position>(`${this.apiUrl}/${id}`);
    }

    create(data: Position): Observable<Position> {
        return this.http.post<Position>(this.apiUrl, data);
    }

    update(id: string, data: Position): Observable<Position> {
        return this.http.put<Position>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}

@Injectable({
    providedIn: 'root'
})
export class SkillLevelService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/skill-levels`;

    getAll(): Observable<SkillLevel[]> {
        return this.http.get<SkillLevel[]>(this.apiUrl);
    }

    getActive(): Observable<SkillLevel[]> {
        return this.http.get<SkillLevel[]>(`${this.apiUrl}/active`);
    }
}
