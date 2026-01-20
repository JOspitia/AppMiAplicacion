import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentType {
    id?: string;
    name: string;
    code?: string;
    categoryId?: string;
    categoryName?: string;
    isRequired: boolean;
    requiresExpiration: boolean;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentTypeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/document-types`;

    getAll(): Observable<DocumentType[]> {
        return this.http.get<DocumentType[]>(this.apiUrl);
    }

    getActive(): Observable<DocumentType[]> {
        return this.http.get<DocumentType[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<DocumentType> {
        return this.http.get<DocumentType>(`${this.apiUrl}/${id}`);
    }

    create(data: DocumentType): Observable<DocumentType> {
        return this.http.post<DocumentType>(this.apiUrl, data);
    }

    update(id: string, data: DocumentType): Observable<DocumentType> {
        return this.http.put<DocumentType>(`${this.apiUrl}/${id}`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
