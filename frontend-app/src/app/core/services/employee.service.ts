import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeListDto {
    id: string;
    fullName: string;
    identificationNumber: string;
    emailCorporate: string;
    positionName: string;
    departmentName: string;
    active: boolean;
    photoUrl: string;
}

export interface EmployeePersonalStepDto {
    id?: string;
    firstName: string;
    lastName: string;
    firstLastName?: string;
    secondLastName?: string;
    identificationTypeId: string;
    identificationNumber: string;
    identificationIssueDate?: string;
    identificationIssueCountryId?: string;
    identificationIssueStateId?: string;
    identificationIssuePlaceId?: string;
    birthDate?: string;
    birthCountryId?: string;
    birthStateId?: string;
    birthPlaceId?: string;
    genderId?: string;
    maritalStatusId?: string;
    nationalityId?: string;
    bloodTypeId?: string;
    rhFactorId?: string;
    photoUrl?: string;
    emailPersonal?: string;
    emailCorporate?: string;
    phoneMobile?: string;
    phoneHome?: string;
    phoneAlternate?: string;
    address?: string;
    residenceCountryId?: string;
    residenceStateId?: string;
    residenceCityId?: string;
    emergencyContacts?: any[];
    familyNucleus?: any[];
    workExperiences?: any[];
    educations?: any[];
    references?: any[];
    bankName?: string;
    bankAccountType?: string;
    bankAccountNumber?: string;
    shirtSizeId?: string;
    pantsSizeId?: string;
    shoeSizeId?: string;
    educationLevelId?: string;
    experienceRangeId?: string;
    socioeconomicStratum?: string;
    militaryStatus?: string;
    isPep?: boolean;
    active?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/employees`;

    getAll(): Observable<EmployeeListDto[]> {
        return this.http.get<EmployeeListDto[]>(this.apiUrl);
    }

    getPersonalData(id: string): Observable<EmployeePersonalStepDto> {
        return this.http.get<EmployeePersonalStepDto>(`${this.apiUrl}/${id}/personal`);
    }

    createStep1(data: EmployeePersonalStepDto): Observable<EmployeePersonalStepDto> {
        return this.http.post<EmployeePersonalStepDto>(`${this.apiUrl}/step1`, data);
    }

    updateStep1(id: string, data: EmployeePersonalStepDto): Observable<EmployeePersonalStepDto> {
        return this.http.put<EmployeePersonalStepDto>(`${this.apiUrl}/${id}/step1`, data);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
