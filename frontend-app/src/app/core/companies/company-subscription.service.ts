import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ModuleSubscription {
    id: string; // Module ID
    code: string;
    name: string;
    description: string;
    isSubscribed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CompanySubscriptionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/management/companies`;

    listModules(companyId: string): Observable<ModuleSubscription[]> {
        return this.http.get<ModuleSubscription[]>(`${this.apiUrl}/${companyId}/subscriptions`);
    }

    toggleModule(companyId: string, moduleId: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${companyId}/subscriptions/${moduleId}/toggle`, {});
    }
}
