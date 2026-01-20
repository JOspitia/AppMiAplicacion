import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkScheduleTimeSlot {
    id?: string;
    slotOrder: number;
    startTime: string;
    endTime: string;
    isNextDay?: boolean;
    breakMinutes?: number;
}

export interface WorkScheduleDay {
    id?: string;
    dayNumber: number;
    isRestDay: boolean;
    startTime?: string;
    endTime?: string;
    isNextDay?: boolean;
    breakMinutes?: number;
    timeSlots?: WorkScheduleTimeSlot[];
}

export interface WorkSchedule {
    id?: string;
    name: string;
    description?: string;
    scheduleType: string; // 'WEEKLY' | 'CYCLICAL'
    cycleLengthDays?: number;
    toleranceMinutes?: number;
    color?: string;
    maxWeeklyHours?: number;
    totalWeeklyHours?: number;
    referenceDate?: string; // ISO date format (YYYY-MM-DD)
    firstDayOfWeek?: number; // 1=Monday, 7=Sunday
    active?: boolean;
    days?: WorkScheduleDay[];
}

@Injectable({
    providedIn: 'root'
})
export class WorkScheduleService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/rrhh/work-schedules`;

    getAll(): Observable<WorkSchedule[]> {
        return this.http.get<WorkSchedule[]>(this.apiUrl);
    }

    getActive(): Observable<WorkSchedule[]> {
        return this.http.get<WorkSchedule[]>(`${this.apiUrl}/active`);
    }

    getById(id: string): Observable<WorkSchedule> {
        return this.http.get<WorkSchedule>(`${this.apiUrl}/${id}`);
    }

    create(data: WorkSchedule): Observable<WorkSchedule> {
        return this.http.post<WorkSchedule>(this.apiUrl, data);
    }

    update(id: string, data: WorkSchedule): Observable<WorkSchedule> {
        return this.http.put<WorkSchedule>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleActive(id: string): Observable<WorkSchedule> {
        return this.http.patch<WorkSchedule>(`${this.apiUrl}/${id}/toggle-active`, {});
    }
}
