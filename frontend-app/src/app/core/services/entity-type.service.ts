import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EntityType {
    id: string;
    name: string;
    description?: string;
    active: boolean;
}

@Injectable({ providedIn: 'root' })
export class EntityTypeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/configuration/entity-types`;

    getAll(): Observable<EntityType[]> {
        return this.http.get<EntityType[]>(this.apiUrl);
    }
}
