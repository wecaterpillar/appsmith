const commonlocators = require("../../../../locators/commonlocators.json");
const dsl = require("../../../../fixtures/buttonApiDsl.json");
const widgetsPage = require("../../../../locators/Widgets.json");
const publishPage = require("../../../../locators/publishWidgetspage.json");
let dataSet;
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("Test Create Api and Bind to Button widget", function () {
  before("Test_Add users api and execute api", () => {
    cy.addDsl(dsl);
    cy.fixture("example").then(function (data) {
      dataSet = data;
      _.apiPage.CreateAndFillApi(dataSet.userApi + "/random");
      cy.RunAPI();
    });
  });

  it("1. Call the api with & without error handling", () => {
    _.entityExplorer.SelectEntityByName("Button1");
    cy.get(widgetsPage.toggleOnClick)
      .invoke("attr", "class")
      .then((classes) => {
        if (classes.includes("is-active")) {
          cy.get(widgetsPage.toggleOnClick).click();
        }
      });
    cy.get(widgetsPage.toggleOnClick).click();

    cy.get(".t--property-control-onclick").then(($el) => {
      cy.updateCodeInput($el, "{{Api1.run()}}");
    });

    _.deployMode.DeployApp();

    cy.wait(3000);
    cy.get("span:contains('Submit')").closest("div").click();

    cy.wait("@postExecute").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      200,
    );

    cy.get(commonlocators.toastAction)
      .should("have.length", 1)
      .should("contain.text", "failed to execute");

    cy.get(publishPage.backToEditor).click({ force: true });

    //With Error handling
    _.entityExplorer.SelectEntityByName("Button1");

    cy.get(".t--property-control-onclick").then(($el) => {
      cy.updateCodeInput($el, "{{Api1.run(() => {}, () => {})}}");
    });

    _.deployMode.DeployApp();

    cy.wait(3000);
    cy.get("span:contains('Submit')").closest("div").click();

    cy.wait("@postExecute").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      200,
    );

    cy.get(commonlocators.toastAction).should("not.exist");
  });
});
