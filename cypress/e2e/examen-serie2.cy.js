// Examen final - Serie II: pruebas Cypress del Admin de Productos
describe("Serie II - Admin de Productos", () => {
  let productosIniciales // cantidad de productos del CSV oficial (no se supone un numero fijo)

  before(() => {
    cy.readFile("public/productos.csv").then((csv) => {
      productosIniciales = csv.trim().split("\n").length - 1 // menos la fila de encabezados
    })
  })

  beforeEach(() => {
    // Cada prueba empieza limpia: sin sesion ni productos guardados de otra prueba
    cy.intercept("GET", "**/productos.csv").as("catalogo")
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear()
      },
    })
    cy.wait("@catalogo") // espera a que la app pida el catalogo inicial
  })

  // Inicia sesion y espera a que el catalogo inicial ya este en la tabla
  function iniciarSesion() {
    cy.get("#usuario").type("admin")
    cy.get("#clave").type("1234")
    cy.get("#btn-login").click()
    cy.get("#admin").should("be.visible")
    cy.get(".fila-producto").should("have.length", productosIniciales)
  }

  it("1. Inicia sesion y muestra el panel de administracion", () => {
    cy.get("#usuario").type("admin")
    cy.get("#clave").type("1234")
    cy.get("#btn-login").click()

    cy.get("#admin").should("be.visible")
    cy.get("#login").should("not.be.visible")
    cy.contains("h1", "Administracion de Productos").should("be.visible")
  })

  it("2. Agrega un producto y aparece en la tabla", () => {
    iniciarSesion()

    cy.get("#nombre").type("Producto Serie II")
    cy.get("#precio").type("250")
    cy.get("#stock").type("12")
    cy.get("#btn-guardar").click()

    cy.get("#form-msg").should("have.text", "")
    cy.get(".fila-producto").should("have.length", productosIniciales + 1)
    cy.contains(".fila-producto", "Producto Serie II")
      .should("be.visible")
      .and("contain", "Q250")
      .and("contain", "12")
  })

  it("3. No permite agregar un producto con precio 0", () => {
    iniciarSesion()

    cy.get("#nombre").type("Producto Precio Cero")
    cy.get("#precio").type("0")
    cy.get("#stock").type("5")
    cy.get("#btn-guardar").click()

    cy.get("#form-msg")
      .should("be.visible")
      .and("have.text", "El precio debe ser un numero mayor que 0.")
    cy.get(".fila-producto").should("have.length", productosIniciales)
    cy.contains(".fila-producto", "Producto Precio Cero").should("not.exist")
  })
})
