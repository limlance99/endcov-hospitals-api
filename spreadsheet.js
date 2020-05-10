const fs = require("fs");
var contents = fs.readFileSync("listOfDuplicates.json");
// Define to JSON type
const duplicates = JSON.parse(contents);

const {GoogleSpreadsheet} = require('google-spreadsheet');
// const { promisify } = require('util');

const creds = require('./client_secret.json');

const accessSpreadsheet = async function(Municipality, Province) {
    const doc = new GoogleSpreadsheet('1_jtQIH2K_MWxZevBCJ1NGO1DY7loHv1FWWGeq-mvksc');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    var sheet, rows;
    console.log("hello", Municipality, Province);
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