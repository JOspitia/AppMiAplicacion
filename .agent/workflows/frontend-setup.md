---
description: Crear una SPA moderna (HR Tech) con Angular, Tailwind CSS, PrimeNG y Glassmorphism, configurada para Cloudflare.
---

# WORKFLOW 2: FRONTEND (Angular + Tailwind + PrimeNG)

Objetivo: Crear una interfaz **Premium (HR Tech)** independiente, optimizada para Cloudflare en el puerto 8080.

## 1. Inicialización y Dependencias
Ejecuta esto en tu terminal para crear el proyecto y configurar el diseño:

// turbo
```bash
# 1. Crear proyecto (Standalone components)
ng new frontend-app --style=css --routing --ssr=false
cd frontend-app

# 2. Instalar dependencias modernas
npm install -D tailwindcss postcss autoprefixer
npm install primeng primeicons @primeng/themes @angular/animations
```

## 2. Configuración de Estilos (styles.css con Tailwind v4 + Glassmorphism)
Estética: Diseño centrado en el humano, paletas **Indigo/Teal**, Glassmorphism y fuentes **Plus Jakarta Sans**.

```css
@import "tailwindcss";
@import "primeicons/primeicons.css";

@theme {
  --color-primary: #4f46e5; /* Indigo 600 */
  --color-secondary: #0d9488; /* Teal 600 */
  --font-sans: "Plus Jakarta Sans", sans-serif;
  
  --bg-glass: rgba(255, 255, 255, 0.7);
  --border-glass: rgba(255, 255, 255, 0.3);
}

/* Glassmorphism Utility */
.glass {
    background: var(--bg-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border-glass);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.dark .glass {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Override de PrimeNG para que use tus fuentes */
.p-component {
    font-family: var(--font-sans);
}
```

## 3. Configuración de PrimeNG (app.config.ts)
```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark'
        }
      }
    })
  ]
};
```

## 4. Configuración de Proxy (Puerto 8081 Backend)
Crea el archivo `proxy.conf.json` en la raíz.

```json
{
  "/api": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

En `angular.json`, busca "serve" y añade: `"options": { "proxyConfig": "proxy.conf.json" }`

## 5. Configuración Nginx para Cloudflare (Puerto 8080)
Crea un archivo `nginx.conf` en la raíz del frontend.

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para el API
    location /api/ {
        proxy_pass http://rrhh_backend:8080/;
    }

    # Cacheo de estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

## 6. Dockerfile (Frontend)
```dockerfile
# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servidor
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```
