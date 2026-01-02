describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('should display the login form', () => {
        cy.contains('Bienvenido').should('be.visible')
        cy.get('input[formControlName="usernameOrEmail"]').should('be.visible')
        cy.get('button[type="submit"]').should('contain', 'INGRESAR')
    })

    it('should show error for invalid credentials', () => {
        cy.get('input[formControlName="usernameOrEmail"]').type('wronguser')
        cy.get('p-password input').type('wrongpass')
        cy.get('button[type="submit"]').click()

        // Assuming backend returns 401 and UI shows error
        // Based on code: this.error = 'Credenciales incorrectas...'
        cy.contains('Credenciales incorrectas').should('be.visible')
    })

    it('should login successfully with admin credentials', () => {
        // Adjust these credentials if they are different in your local env
        cy.get('input[formControlName="usernameOrEmail"]').type('admin')
        cy.get('p-password input').type('admin123')
        cy.get('button[type="submit"]').click()

        // Assert redirection or success
        cy.url().should('not.include', '/login')
    })
})
