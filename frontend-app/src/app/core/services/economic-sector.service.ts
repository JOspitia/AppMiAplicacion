import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface EconomicSector {
    id: string;
    name: string;
    description?: string;
    active: boolean;
}

@Injectable({ providedIn: 'root' })
export class EconomicSectorService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/configuration/economic-sectors`;

    getAll(): Observable<EconomicSector[]> {
        return this.http.get<EconomicSector[]>(this.apiUrl);
    }
}
