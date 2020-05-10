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
                if (rows[i]["City/Municipality"] == Municipality && rows[i]["Province"] == Province) return rows[i];
            }
        } else {
            for(let i = 0; i < rows.length; i++) {
                if (rows[i]["City/Municipality"] == Municipality) return rows[i];
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
}

module.exports = ({
    accessSpreadsheet
})

// const testFunction = async function() {
//     const doc = new GoogleSpreadsheet('1_jtQIH2K_MWxZevBCJ1NGO1DY7loHv1FWWGeq-mvksc');
//     await doc.useServiceAccountAuth(creds);
//     await doc.loadInfo();
//     const sheet = doc.sheetsByIndex[8];
//     var rows = await sheet.getRows();

//     var itemlist = [];
//     var duplicates = [];
//     for (let row of rows) {
//         if (!(itemlist.includes(row["City/Municipality"]))) itemlist.push(row["City/Municipality"]);
//         else if (!(duplicates.includes(row["City/Municipality"]))) duplicates.push(row["City/Municipality"]);
//     }

//     console.log("Total numer of cities:", rows.length);
//     console.log("Total number of cities (no duplicates):", itemlist.length);
//     console.log("Total number of duplicates:", duplicates.length);
//     console.log("\nList of cities:\n");
//     for (let item of itemlist) {
//         console.log(item);
//     }
// }

// testFunction();