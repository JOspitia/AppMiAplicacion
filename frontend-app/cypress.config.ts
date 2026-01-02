import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        // Apuntamos al frontend dockerizado (Nginx) en el puerto 8080.
        // Si prefieres usar 'ng serve' para desarrollo, cambia esto a 'http://localhost:4200'.
        // Si quieres probar producción/cloudflare, usa 'https://appmiaplicacion.com'.
        baseUrl: 'http://localhost:8080',
        supportFile: 'cypress/support/e2e.ts',
        // Opcional: Deshabilitar seguridad web si tienes problemas CORS con dominios cruzados
        chromeWebSecurity: false,
    },
})
