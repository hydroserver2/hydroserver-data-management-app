describe('Signup', () => {
  beforeEach(() => {
    cy.viewport(1500, 1200)
  })

  it('Renders page', () => {
    cy.visit('/sign-up')
    cy.get('.signup-title').contains('Sign Up')
  })

  // it('error state', () => {})
  // it('successfully creates a user and logs them in', () => {})
})
