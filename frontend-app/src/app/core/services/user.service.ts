import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserManagement {
    id: string; // UserCompanyRole ID (primary assignment)
    userId: string;
    username: string;
    email: string;
    firstName: string;
    firstSurname: string;
    secondSurname?: string;
    roleNames: string[];
    roleIds: string[];
    verified: boolean;
    active: boolean;
    createdAt: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    firstName: string;
    firstSurname: string;
    secondSurname?: string;
    roleIds: string[];
    active: boolean;
    forceLink?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = '/api/core/management/users';

    getAll(): Observable<UserManagement[]> {
        return this.http.get<UserManagement[]>(this.apiUrl);
    }

    toggleActive(id: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/toggle`, {});
    }

    getById(id: string): Observable<UserManagement> {
        return this.http.get<UserManagement>(`${this.apiUrl}/${id}`);
    }

    create(user: CreateUserRequest): Observable<UserManagement> {
        return this.http.post<UserManagement>(this.apiUrl, user);
    }

    updateRoles(userId: string, roleIds: string[]): Observable<UserManagement> {
        return this.http.put<UserManagement>(`${this.apiUrl}/${userId}/roles`, { roleIds });
    }

    assignRole(userId: string, roleId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
    }

    removeRole(userId: string, roleId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${userId}/roles/${roleId}`);
    }
}
