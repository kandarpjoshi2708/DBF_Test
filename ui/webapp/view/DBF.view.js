sap.ui.jsview("ui.ui.view.DBF", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf controller.DBF
	 */
	getControllerName: function () {
		return "ui.ui.controller.DBF";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * @memberOf controller.DBF
	 */
	createContent: function (oController) {
		var oModel = new sap.ui.model.odata.v2.ODataModel("/ui.xsodata/", { json: true });
        oModel.setRefreshAfterChange(true);
        
        var oParamsTable = new sap.m.Table({
            mode: sap.m.ListMode.SingleSelectLeft,
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Parameter ID" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Parameter Description" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Parameter Value" }) })
            ],
            items: {
                path: "/Parameters",
                parameters: {
                    select: "Param_Key,Param_Desc,Param_Type"
                },
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{Param_Key}" }),
                        new sap.m.Text({ text: "{Param_Desc}" }),
                        new sap.m.Text({ text: "{Param_Type}" })
                    ]
                })
            }
        });

        oParamsTable.setHeaderText("Parameter Table");
        oParamsTable.setModel(oModel);
        
        
        // Dialog popup
        var oDialog = null,
            oUpdateConfirmBtn = null,
            oAddConfirmBtn = null;

        var oAddBtn = new sap.m.Button({
            text: "Add",
            press: function() {
                if (!oDialog.isOpen()) {
                    oDialog.setTitle("Insert Item into Table");
                    oUpdateConfirmBtn.setVisible(false);
                    oAddConfirmBtn.setVisible(true);
                    sap.ui.getCore().byId("Param_Key").setValue("");
                    sap.ui.getCore().byId("Param_Desc").setValue("");
                    sap.ui.getCore().byId("Param_Type").setValue("");
                    oDialog.open();
                }
            }
        });

        var oDeleteBtn = new sap.m.Button({
            text: "Delete",
            press: function() {
                var contexts = oParamsTable.getSelectedContexts();
                if (contexts.length === 0) {
                    sap.m.MessageToast.show("Please select a row.");
                } else {
                    oModel.remove(contexts[0].sPath, {
                        success: function() {
                            sap.m.MessageToast.show("The item has been deleted.");
                        },
                        error: function() {
                            sap.m.MessageToast.show("An error occured when deleting the item.");
                        }
                    });
                }
            }
        });

        var oUpdateBtn = new sap.m.Button({
            text: "Update",
            press: function() {
                var contexts = oParamsTable.getSelectedContexts();
                if (contexts.length === 0) {
                    sap.m.MessageToast.show("Please select a row.");
                } else {
                    if (!oDialog.isOpen()) {
                        oDialog.setTitle("Update Item into Table");
                        oUpdateConfirmBtn.setVisible(true);
                        oAddConfirmBtn.setVisible(false);
                        sap.ui.getCore().byId("Param_Key").setValue(contexts[0].getProperty("Param_Key")).setEnabled(false);
                        sap.ui.getCore().byId("Param_Desc").setValue(contexts[0].getProperty("Param_Desc"));
                        sap.ui.getCore().byId("Param_Type").setValue(contexts[0].getProperty("Param_Type"));
                        oDialog.open();
                    }
                }
            }
        });

        oAddConfirmBtn = new sap.m.Button({
            text: "Add",
            press: function() {
                var oNewItem = {
                    Param_Key: sap.ui.getCore().byId("Param_Key").getValue(),
                    Param_Desc: sap.ui.getCore().byId("Param_Desc").getValue(),
                    Param_Type: sap.ui.getCore().byId("Param_Type").getValue()
                };
                if (oNewItem.Param_Key.length === 0 || oNewItem.Param_Type.length === 0) {
                    sap.m.MessageToast.show("The Parameter and Value fields are required fields.");
                } else {
                    oModel.create("/Parameters", oNewItem, {
                        success: function() {
                            sap.m.MessageToast.show("The item has been added.");
                            oDialog.close();
                        },
                        error: function() {
                            sap.m.MessageToast.show("An error occured when adding the item.");
                            oDialog.close();
                        }
                    });
                }
            }
        });

        oUpdateConfirmBtn = new sap.m.Button({
            text: "Update",
            press: function() {
                var oNewItem = {
                    Param_Key: sap.ui.getCore().byId("Param_Key").getValue(),
                    Param_Desc: sap.ui.getCore().byId("Param_Desc").getValue(),
                    Param_Type: sap.ui.getCore().byId("Param_Type").getValue()
                };
                var contexts = oParamsTable.getSelectedContexts();
                if (oNewItem.Param_Key.length === 0 || oNewItem.Param_Type.length === 0) {
                    sap.m.MessageToast.show("The Parameter and Value fields are required fields.");
                } else {
                    oModel.update(contexts[0].sPath, oNewItem, {
                        success: function() {
                            sap.m.MessageToast.show("The item has been updated.");
                            oDialog.close();
                        },
                        error: function() {
                            sap.m.MessageToast.show("An error occured when updating the item.");
                            oDialog.close();
                        }
                    });
                }
            }
        });

        var oCancelBtn = new sap.m.Button({
            text: "Cancel",
            press: function() {
                if (oDialog.isOpen()) {
                    oDialog.close();
                }
            }
        });

        oDialog = new sap.m.Dialog({
            title: "",
            buttons: [oAddConfirmBtn, oUpdateConfirmBtn, oCancelBtn],
            content: [
                new sap.m.Label({ text: "Parameter ID" }),
                new sap.m.Input("Param_Key", {}),
                new sap.m.Label({ text: "Parameter Description" }),
                new sap.m.Input("Param_Desc", {}),
                new sap.m.Label({ text: "Parameter Value" }),
                new sap.m.Input("Param_Type", {})
            ]
        });

        var oTableButtons = new sap.m.OverflowToolbar({
            width: "100%",
            content: [oAddBtn, oUpdateBtn, oDeleteBtn]
        });
        
        var oPage = new sap.m.Page({
            title: "{i18n>title}",
            content: new sap.m.IconTabBar({
                title: "Testing",
                items: [
                    new sap.m.IconTabFilter({
                        key: "main",
                        text: "Settings",
                       content: [oParamsTable, oTableButtons]
                    })
                ]
            })
        });
        
		var app = new sap.m.App("myApp", {
		             initialPage: "oPage"
		});
		
		app.addPage(oPage);
		
		return app;
	}
});