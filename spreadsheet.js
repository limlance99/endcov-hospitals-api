const fs = require("fs");
var contents = fs.readFileSync("database/listOfDuplicates.json");
// Define to JSON type
const duplicates = JSON.parse(contents);

const {GoogleSpreadsheet} = require('google-spreadsheet');
// const { promisify } = require('util');

const creds = require('./client_secret.json');

const accessSpreadsheet = async function(Municipality, Province, Country, Region) {
    const doc = new GoogleSpreadsheet('1_jtQIH2K_MWxZevBCJ1NGO1DY7loHv1FWWGeq-mvksc');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    var sheet, rows;
    console.log("hello", Municipality, Province, Country, Region);
    if (Region) {
        sheet = doc.sheetsByIndex[10];
        rows = await sheet.getRows();

        for (let i = 0; i < rows.length; i++) {
            if (rows[i]["Province"] == Region) return rows[i];
        }
        
        return {walangLaman: true};
    } else if (Country) {
        sheet = doc.sheetsByIndex[9];
        await sheet.loadCells(['I2:I5', 'H2']);
        
        return {
            Frequency: sheet.getCellByA1('I2').formattedValue,
            Died: sheet.getCellByA1('I3').formattedValue,
            Recovered: sheet.getCellByA1('I4').formattedValue,
            "Active (Positive-Recovered-Died)": sheet.getCellByA1('I5').formattedValue,
            Date: sheet.getCellByA1('H2').formattedValue,
        };
    }

    if (Municipality) {
        sheet = doc.sheetsByIndex[8];
        rows = await sheet.getRows();

        if (Province) {
            for(let i = 0; i < rows.length; i++) {
                if ((rows[i]["City/Municipality"] == Municipality || rows[i]["City/Municipality"].includes(Municipality)) && rows[i]["Province"] == Province) return rows[i];
            }
        } else {

            if (duplicates.includes(Municipality)) return {duplicateFound: true};
            for(let i = 0; i < rows.length; i++) {
                if (rows[i]["City/Municipality"] == Municipality || rows[i]["City/Municipality"].includes(Municipality)) return rows[i];
            }
        }
        return {walangLaman: true};
    } else if (Province) {
        sheet = doc.sheetsByIndex[9];
        rows = await sheet.getRows();

        for (let i = 0; i < rows.length; i++) {
            if (rows[i]["Province"] == Province) return rows[i];
        }

        return {walangLaman: true};
    } 
    return {walangLaman: true};
}

module.exports = ({
    accessSpreadsheet
})
