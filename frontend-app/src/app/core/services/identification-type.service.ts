import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IdentificationType {
    id?: string;
    name: string;
    code?: string;
    isRequired?: boolean;
    requiresExpiration?: boolean;
    active?: boolean;
    countryId?: string;
    countryName?: string;
    categoryId?: string;
    categoryName?: string;
    validationRegex?: string;
    isGlobal?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class IdentificationTypeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/identification-types`;

    getAll(): Observable<IdentificationType[]> {
        return this.http.get<IdentificationType[]>(this.apiUrl);
    }

    getActive(): Observable<IdentificationType[]> {
        return this.http.get<IdentificationType[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<IdentificationType> {
        return this.http.get<IdentificationType>(`${this.apiUrl}/${id}`);
    }

    create(data: IdentificationType): Observable<IdentificationType> {
        return this.http.post<IdentificationType>(this.apiUrl, data);
    }

    update(id: string, data: IdentificationType): Observable<IdentificationType> {
        return this.http.put<IdentificationType>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
