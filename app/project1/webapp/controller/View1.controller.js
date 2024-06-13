sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                
            },

            onDownloadBtnPress: function () {
                
                var oModel = this.getView().getModel();
                var sServiceUrl = "/odata/v4/catalog/downloadTemplate";
                var sCiNo = this.getView().byId("input001").getValue();
                var aSelectedItems = this.getView().byId("table001").getSelectedItems();
                
                var aGoods = aSelectedItems.map(function(oItem) {
                    var oBindingContext = oItem.getBindingContext();
                    return {
                        description: oBindingContext.getProperty("description"),
                        unit: oBindingContext.getProperty("unit"),
                        quantity: oBindingContext.getProperty("quantity")
                    }
                })
                console.log(aGoods);
                var oData = {
                    ciNo: sCiNo,
                    goods:aGoods
                };
                console.log(oData);
                try {
                    jQuery.ajax({
                        url: sServiceUrl,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify(oData),
                        success: function (oData) {
                            try {
                                var binary = atob(oData.value);
                                var array = [];
                                for (var i = 0; i < binary.length; i++) {
                                    array.push(binary.charCodeAt(i));
                                }
                                var blob = new Blob([new Uint8Array(array)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                var link = document.createElement("a");
                                link.href = window.URL.createObjectURL(blob);
                                link.download = "FilledTemplate.xlsx";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                sap.m.MessageToast.show("Template downloaded successfully.");
                            } catch (e) {
                                console.error("Error processing the download:", e.message);
                                sap.m.MessageToast.show("Error processing the download.");
                            }
                        },
                        error: function (oError) {
                            console.error("Error during request to the service:", oError);
                            sap.m.MessageToast.show("Error downloading template.");
                        }
                    });
                } catch (e) {
                    console.error("Error initiating the download:", e);
                    sap.m.MessageToast.show("Error initiating the download.");
                }

            }
        });
    });
