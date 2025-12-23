import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName: string;
    firstSurname: string;
    secondSurname?: string;
    phoneNumber?: string;
    phoneExtension?: string;
    address?: string;
    country?: string;
    department?: string;
    city?: string;
    genderId?: string;
    genderName?: string;
    dateOfBirth?: string;
    age?: number;
    pendingEmail?: string;
    isSuperAdmin: boolean;
    verified: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = '/api/profile'; // Assuming this endpoint will be created/mapped

    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.apiUrl}/me`);
    }

    updateProfile(data: Partial<UserProfile>): Observable<any> {
        return this.http.post(`${this.apiUrl}/update`, data);
    }

    verifyPassword(password: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/verify-password`, { password });
    }

    changeEmail(newEmail: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-email`, { newEmail });
    }

    changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword, confirmPassword });
    }

    getCountries(): Observable<any[]> {
        return this.http.get<any[]>('/api/geo/countries');
    }

    getStates(countryId: string): Observable<any[]> {
        return this.http.get<any[]>(`/api/geo/states?countryId=${countryId}`);
    }

    getCities(stateId: string): Observable<any[]> {
        return this.http.get<any[]>(`/api/geo/cities?stateId=${stateId}`);
    }

    getGenders(): Observable<any[]> {
        return this.http.get<any[]>('/api/geo/genders');
    }
}
