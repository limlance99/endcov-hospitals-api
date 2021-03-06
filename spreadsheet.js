const fs = require("fs");
var contents = fs.readFileSync("database/listOfDuplicates.json");
// Define to JSON type
var duplicates = JSON.parse(contents);

for (let i = 0; i < duplicates.length; i++) duplicates[i] = duplicates[i].toLowerCase();

const {GoogleSpreadsheet} = require('google-spreadsheet');
// const { promisify } = require('util');

const creds = require('./client_secret.json');

const accessSpreadsheet = async function(Municipality, Province, Country, Region) {
    const doc = new GoogleSpreadsheet('1_jtQIH2K_MWxZevBCJ1NGO1DY7loHv1FWWGeq-mvksc');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    Municipality = Municipality.toLowerCase();
    Province = Province.toLowerCase();
    Country = Country.toLowerCase();
    Region = Region.toLowerCase();

    var sheet, rows;
    console.log("hello", Municipality, Province, Country, Region);
    if (Region) {
        sheet = doc.sheetsById[1465928900]; // CovidCase per Reg
        rows = await sheet.getRows();

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]["Province"].toLowerCase();
            if (row == Region) return rows[i];
        }
        
        return {walangLaman: true};
    } else if (Country) {
        sheet = doc.sheetsById[1465928900]; // CovidCase per Prov
        await sheet.loadCells(['L2:L5', 'G2']);
        
        return {
            Frequency: sheet.getCellByA1('L2').formattedValue,
            Died: sheet.getCellByA1('L3').formattedValue,
            Recovered: sheet.getCellByA1('L4').formattedValue,
            "Active (Positive-Recovered-Died)": sheet.getCellByA1('L5').formattedValue,
            Date: sheet.getCellByA1('G2').formattedValue,
        };
    }

    if (Municipality) {
        sheet = doc.sheetsById[908968772]; //CovidCase per Mun
        rows = await sheet.getRows();

        if (Province) {
            for(let i = 0; i < rows.length; i++) {
                let row_mun = rows[i]["City/Municipality"].toLowerCase();
                let row_prov = rows[i]["Province"].toLowerCase();
                if ((row_mun == Municipality || row_mun.includes(Municipality)) && row_prov == Province) return rows[i];
            }
        } else {

            if (duplicates.includes(Municipality)) return {duplicateFound: true};
            for(let i = 0; i < rows.length; i++) {
                let row = rows[i]["City/Municipality"].toLowerCase();
                if (row == Municipality || row.includes(Municipality)) return rows[i];
            }
        }
        return {walangLaman: true};
    } else if (Province) {
        sheet = doc.sheetsById[1451886157]; // CovidCase per Prov
        rows = await sheet.getRows();

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]["Province"].toLowerCase();
            if (row == Province) return rows[i];
        }

        return {walangLaman: true};
    } 
    return {walangLaman: true};
}

module.exports = ({
    accessSpreadsheet
})
