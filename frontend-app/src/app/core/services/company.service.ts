import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface CompanyWebsite {
    id?: string;
    url: string;
    isPrimary?: boolean;
    description?: string;
}

export interface Company {
    // Basic Information
    id?: string;
    name: string; // Nombre Comercial
    nit: string;

    // Business Information
    legalName?: string; // Razón Social
    entityTypeId?: string;
    entityTypeName?: string;
    sectorId?: string; // Economic Sector
    sectorName?: string;
    otherSector?: string;
    description?: string;

    // Contact Information
    notificationEmail?: string;
    mainPhone?: string; // Teléfono fijo / Conmutador
    mobilePhone?: string; // Teléfono celular
    phoneExtension?: string; // Código de país

    // Address Information
    countryId?: string;
    countryName?: string;
    stateId?: string;
    stateName?: string;
    cityId?: string;
    cityName?: string;
    streetAddress?: string;
    postalCode?: string;

    // Websites
    websites?: CompanyWebsite[];

    // Branding
    logoUrl?: string;
    primaryColor?: string; // #RRGGBB

    // Operational Parameters
    allowedDomain?: string;

    // Calculated/Display Fields
    activeEmployeeCount?: number; // Calculated: count of active employees

    // Subscription & Status
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
    subscriptionNotificationPending?: boolean;
    status: boolean;

    // Audit Information
    createdById?: string;
    createdByName?: string;
    updatedById?: string;
    updatedByName?: string;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/core/management/companies`;

    getAll(): Observable<Company[]> {
        return this.http.get<Company[]>(this.apiUrl);
    }

    getById(id: string): Observable<Company> {
        return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }

    create(company: Company): Observable<Company> {
        return this.http.post<Company>(this.apiUrl, company);
    }

    update(id: string, company: Company): Observable<Company> {
        return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
    }

    // Change active status (activate/inactivate)
    setStatus(id: string, status: boolean): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadLogo(companyId: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${environment.apiUrl}/core/management/companies/${companyId}/logo`, formData);
    }

}
