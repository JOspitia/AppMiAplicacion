describe('Login Security & Edge Cases', () => {
    beforeEach(() => {
        // 3. Limpieza de estado: Buenas prácticas
        cy.clearLocalStorage()
        cy.clearCookies()
        cy.visit('/login')
    })

    // 1. Prueba de Inyección SQL
    it('should handle SQL Injection attempts gracefully', () => {
        const payload = "' OR '1'='1"
        cy.get('input[formControlName="usernameOrEmail"]').clear().type(payload)
        cy.get('p-password input').clear().type('password123')

        // 4. Verificar estado del botón (Reactive Forms) - Debe estar habilitado porque el formato "es válido" aunque sea malicioso
        cy.get('button[type="submit"]').should('not.be.disabled').click()

        cy.url().should('include', '/login')

        // 1. Evitar "Condition Testing": Usamos regex para validar cualquiera de los dos mensajes esperados
        // Buscamos el contenedor de error por su clase de Tailwind distintiva
        cy.get('.bg-red-500\\/10').should('be.visible')
            .invoke('text')
            .should('match', /Credenciales incorrectas|Límite de intentos/)
    })

    // 2. Prueba de XSS
    it('should sanitize XSS script injection attempts', () => {
        const xssPayload = "<script>alert('HACKED')</script>"
        cy.get('input[formControlName="usernameOrEmail"]').clear().type(xssPayload)
        cy.get('p-password input').clear().type('somepassword')
        cy.get('button[type="submit"]').click()

        cy.on('window:alert', (str) => {
            throw new Error('XSS Vulnerability Detected: Alert executed with message: ' + str)
        })

        // Validación robusta sin if/else
        cy.get('.bg-red-500\\/10').should('be.visible')
            .invoke('text')
            .should('match', /Credenciales incorrectas|Límite de intentos/)
    })

    // Validación extra: Campos Vacíos
    it('should keep submit button disabled for empty fields', () => {
        cy.get('input[formControlName="usernameOrEmail"]').clear()
        cy.get('p-password input').clear()

        // El botón DEBE estar deshabilitado por Validators.required
        cy.get('button[type="submit"]').should('be.disabled')
    })

    // 3. Prueba de UI ante Rate Limit (Mocked)
    it('should show user feedback when Rate Limit is hit', () => {
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 429,
            body: { message: 'Too many requests' }
        }).as('blockedLogin')

        cy.get('input[formControlName="usernameOrEmail"]').type('test_user')
        cy.get('p-password input').type('any_password')
        cy.get('button[type="submit"]').click()

        cy.wait('@blockedLogin')

        cy.get('.bg-red-500\\/10').should('be.visible')
            .and('contain.text', 'Límite de intentos seguridad excedido')
    })
})
