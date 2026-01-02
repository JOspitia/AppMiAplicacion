describe('Flujo Completo: Registro con Correo Dinámico', () => {

    const testUser = {
        // Generamos un usuario aleatorio para evitar error de "Usuario ya existe"
        username: 'cy_test_' + Math.floor(Math.random() * 10000),
        firstName: 'Johan',
        firstSurname: 'Cypress',
        password: 'TestPassword123!'
    }

    it('Permite ingresar correo manually, valida y loguea', () => {
        let capturedEmail = '';

        // 1. Paso de Registro
        cy.visit('/register')

        // Llenamos datos automáticos
        cy.get('input[formControlName="username"]').type(testUser.username)
        cy.get('input[formControlName="firstName"]').type(testUser.firstName)
        cy.get('input[formControlName="firstSurname"]').type(testUser.firstSurname)
        cy.get('p-password[formControlName="password"] input').type(testUser.password)
        cy.get('p-password[formControlName="confirmPassword"] input').type(testUser.password)

        // 2. INTERACCIÓN MANUAL: Correo
        cy.get('input[formControlName="email"]').focus()

        // Mensaje para el tester
        cy.log('PAUSA PARA INPUT: Por favor escribe el CORREO ELECTRÓNICO en el campo y luego presiona "Resume" (Play).')

        // Pausamos para que el usuario escriba
        cy.pause()

        // 3. CAPTURA del correo ingresado (Para usarlo en el login después)
        cy.get('input[formControlName="email"]').invoke('val').then((val: any) => {
            capturedEmail = val;
            cy.log('Correo capturado:', capturedEmail);
        })

        // Continuamos flujo...
        cy.get('button[type="submit"]').click()

        // Validación: Mensaje de éxito
        cy.contains('¡Registro casi completo!', { timeout: 10000 }).should('be.visible')

        // 4. PAUSA para verificación de link (Gmail)
        cy.then(() => {
            cy.log(`VERIFICACIÓN: Ve al correo ${capturedEmail}, haz click en el enlace y luego presiona "Resume".`)
        })
        cy.pause()

        // 5. Paso de Login (Usando el correo capturado)
        cy.visit('/login')

        // Recuperamos el correo que el usuario escribió
        cy.get('input[formControlName="usernameOrEmail"]').should('be.visible').type(capturedEmail)

        cy.get('p-password input').type(testUser.password)
        cy.get('button[type="submit"]').click()

        // Validación: Login exitoso
        cy.url().should('not.include', '/login')
        cy.get('app-sidebar').should('exist') // Verifica que estemos dentro
    })
})
