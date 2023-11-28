describe('SiteDetails', () => {
  beforeEach(() => {
    cy.viewport(1500, 1200)
    cy.login('paul')
    cy.wait(1000)
    cy.visit('/sites/9344a3d4-a45a-4529-b731-b51149b4d1b8')
  })

  it('renders site content', () => {
    cy.wait(500)
    cy.contains('Site in Miami')
  })

  it('renders owner specific button when logged in', () => {
    cy.contains('Access Control')
  })
})
