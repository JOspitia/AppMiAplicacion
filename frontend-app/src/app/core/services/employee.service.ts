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

export interface EmployeeContractStepDto {
    employeeId?: string;
    contractTypeId: string;
    contractNumber: string;
    startDate: string;
    endDate?: string;
    probationEndDate?: string;
    workScheduleId: string;
    comments?: string;
}

export interface EmployeeDocumentDto {
    id: string;
    documentTypeId: string;
    documentTypeName: string;
    fileName: string;
    filePath?: string;
    expirationDate?: string;
    isUnified: boolean;
}

export interface EmployeeJobStepDto {
    employeeId?: string;
    firstName?: string;
    lastName?: string;
    companyDomain?: string;
    costCenterId: string;
    departmentId: string;
    locationId?: string;
    operationalCenterId?: string;
    positionId: string;
    managerId?: string;
    salary: number;
    currencyCode: string;
    transportAid?: boolean;
    email: string;
    bonuses?: any[];
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

    getContractData(id: string): Observable<EmployeeContractStepDto> {
        return this.http.get<EmployeeContractStepDto>(`${this.apiUrl}/${id}/contract`);
    }

    getEmployeeDocuments(id: string): Observable<EmployeeDocumentDto[]> {
        return this.http.get<EmployeeDocumentDto[]>(`${this.apiUrl}/${id}/documents`);
    }

    updateStep2(id: string, data: EmployeeContractStepDto, files: Map<string, File>, expiries: Map<string, string>, unifiedFile?: File): Observable<void> {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));

        files.forEach((file, typeId) => {
            formData.append(`documents[${typeId}]`, file);
            const expiry = expiries.get(typeId);
            if (expiry) {
                formData.append(`documentExpiry[${typeId}]`, expiry);
            }
        });

        if (unifiedFile) {
            formData.append('unifiedDocument', unifiedFile);
        }

        return this.http.post<void>(`${this.apiUrl}/${id}/step2`, formData);
    }

    getJobData(id: string): Observable<EmployeeJobStepDto> {
        return this.http.get<EmployeeJobStepDto>(`${this.apiUrl}/${id}/job`);
    }

    suggestCorporateEmail(id: string): Observable<string> {
        return this.http.get(`${this.apiUrl}/${id}/suggest-email`, { responseType: 'text' });
    }

    updateStep3(id: string, data: EmployeeJobStepDto): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/step3`, data);
    }
}
