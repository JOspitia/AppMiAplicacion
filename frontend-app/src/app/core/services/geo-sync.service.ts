import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeoStats {
    countries: number;
    states: number;
    cities: number;
    currencies: number;
    phoneCodes: number;
}

export interface SyncResult {
    countriesAdded: number;
    countriesUpdated: number;
    statesAdded: number;
    citiesAdded: number;
    currenciesAdded: number;
    phoneCodesSynced: number;
    durationMs: number;
    error?: string;
}

@Injectable({ providedIn: 'root' })
export class GeoSyncService {
    private http = inject(HttpClient);
    private apiUrl = '/api/core/administration/geo/sync';

    getStats(): Observable<GeoStats> {
        return this.http.get<GeoStats>(`${this.apiUrl}/stats`);
    }

    runSync(): Observable<SyncResult> {
        return this.http.post<SyncResult>(`${this.apiUrl}/run`, {});
    }
}
