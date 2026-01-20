import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
    id?: string;
    name: string;
    address: string;
    city: string;
    department: string;
    country: string;
    isMain: boolean;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/management/locations`;

    getAll(): Observable<Location[]> {
        return this.http.get<Location[]>(this.apiUrl);
    }

    getActive(): Observable<Location[]> {
        return this.http.get<Location[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<Location> {
        return this.http.get<Location>(`${this.apiUrl}/${id}`);
    }

    create(location: Location): Observable<Location> {
        return this.http.post<Location>(this.apiUrl, location);
    }

    update(id: string, location: Location): Observable<Location> {
        return this.http.put<Location>(`${this.apiUrl}/${id}`, location);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }
}
