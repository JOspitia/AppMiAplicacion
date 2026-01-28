import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Country {
    id: string;
    name: string;
    code: string;
    phoneCode: string;
}

export interface State {
    id: string;
    name: string;
    code: string;
}

export interface City {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class GeographyService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/administration/geo`;

    getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.apiUrl}/countries`);
    }

    getStates(countryId: string): Observable<State[]> {
        return this.http.get<State[]>(`${this.apiUrl}/states?countryId=${countryId}`);
    }

    getCities(stateId: string): Observable<City[]> {
        return this.http.get<City[]>(`${this.apiUrl}/cities?stateId=${stateId}`);
    }
}
