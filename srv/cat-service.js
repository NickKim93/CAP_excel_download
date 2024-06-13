const cds = require('@sap/cds');
const exceljs = require('exceljs');
const path = require('path');

module.exports = cds.service.impl(async function () {

    this.on('downloadTemplate', async (req, res) => {

        try {
            const params = req.data;
            console.log(params)
            if (!params.goods || params.goods === 0) {
                console.log("error goods cannot be null")
                return "Error: The 'goods' array is required and cannot be empty.";
            }
            const filename = "sample.xlsx";
            const template = path.join(__dirname, "template", filename);
            const workbook = new exceljs.Workbook();

            await workbook.xlsx.readFile(template);
            const worksheetCI = workbook.getWorksheet("CI");
            const worksheetPL = workbook.getWorksheet("PL");
            if (!worksheetCI || !worksheetPL) {
                console.error("Required worksheets not found in the template.");
                return "Error: Required worksheets not found in the template.";
            }
            worksheetCI.getCell('C4').value = params.ciNo;
            worksheetPL.getCell('D3').value = params.ciNo;
            const startingRowCI = 9;
            const startingRowPL = 8;
            let sum = 0;
            params.goods.forEach((item, index) => {
                const rowCI = worksheetCI.getRow(startingRowCI + index);
                const rowPL = worksheetPL.getRow(startingRowPL + index);
                rowCI.getCell(1).value = item.description;
                rowCI.getCell(2).value = item.unit;
                rowCI.getCell(3).value = item.quantity;
                rowPL.getCell(2).value = item.description;
                rowPL.getCell(3).value = item.unit;
                rowPL.getCell(4).value = item.quantity;

                sum += item.quantity;
                rowCI.commit();
                rowPL.commit();
            });

            const sumRowCI = worksheetCI.getRow(startingRowCI + params.goods.length);
            const sumRowPL = worksheetPL.getRow(startingRowPL + params.goods.length);
            // sumRowCI.getCell(3).value = sum;
            sumRowPL.getCell(2).value = "Total: ";
            sumRowPL.getCell(4).value = sum;
            sumRowCI.getCell(1).value = "Total: ";
            sumRowCI.getCell(3).value = { formula: `SUM(C${startingRowCI}:C${startingRowCI + params.goods.length - 1})`, result: undefined };
            sumRowCI.commit();

            const signatureFilename = 'signature_nick.jpeg';
            const signature = workbook.addImage({
                filename: path.join(__dirname, "template", signatureFilename),
                extension: 'jpeg'
            })
            worksheetCI.addImage(signature, 'B16:C17');
            worksheetPL.addImage(signature, 'C16:D17');
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer.toString('base64');

        } catch (err) {
            console.log(err.message);
            return err
        }

    });
});