describe('Profile Page', () => {
  beforeEach(() => {
    cy.viewport(1500, 1200)
  })

  it('populates form with user information', () => {
    cy.login('paul')
    cy.wait(1000)
    cy.visit('/profile')
    cy.wait(1000)
    cy.contains('Paul')
  })
})
