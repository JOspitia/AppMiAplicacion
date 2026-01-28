import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Gender {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class GenderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/administration/genders`;

    getAll(): Observable<Gender[]> {
        return this.http.get<Gender[]>(this.apiUrl);
    }
}
