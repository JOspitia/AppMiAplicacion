import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol?: string;
    nativeSymbol?: string;
    decimalDigits?: number;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private http = inject(HttpClient);
    private apiUrl = '/api/core/currencies';

    getAll(active?: boolean): Observable<Currency[]> {
        let params: any = {};
        if (active !== undefined) {
            params.active = active.toString();
        }
        return this.http.get<Currency[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Currency> {
        return this.http.get<Currency>(`${this.apiUrl}/${id}`);
    }
}
