describe('Sites', () => {
  beforeEach(() => {
    cy.viewport(1500, 1200)
  })

  it('redirects to login if not logged in', () => {
    cy.visit('/sites')
    cy.url().should('include', '/login')
  })

  it('renders data', () => {
    cy.login('paul')
    cy.url().should('include', '/sites')
    cy.get('.owned-sites-table tbody tr').should('have.length.greaterThan', 0)
  })

  it('links navigate to the correct pages', () => {
    cy.login('paul')
    cy.get('.owned-sites-table tbody tr').first().click()
    cy.contains('Site Information')
  })
})
