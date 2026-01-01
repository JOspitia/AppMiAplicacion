import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    isLoading = signal<boolean>(false);
    private activeRequests = 0;
    private timer: any = null;

    show() {
        this.activeRequests++;
        if (this.activeRequests === 1 && !this.timer) {
            this.timer = setTimeout(() => {
                this.isLoading.set(true);
            }, 250); // Mínimo de 250ms antes de mostrar para evitar parpadeos
        }
    }

    hide() {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.isLoading.set(false);
        }
    }
}
