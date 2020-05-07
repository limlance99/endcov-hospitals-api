const {GoogleSpreadsheet} = require('google-spreadsheet');
// const { promisify } = require('util');

const creds = require('./client_secret.json');

const accessSpreadsheet = async function(Municipality) {
    const doc = new GoogleSpreadsheet('1_jtQIH2K_MWxZevBCJ1NGO1DY7loHv1FWWGeq-mvksc');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[8];
    var rows = await sheet.getRows()

    console.log(Municipality)
    for(let i = 0; i < rows.length; i++) {
        if (rows[i]["City/Municipality"] == Municipality) {
            return rows[i];
        }
    }
}

module.exports = ({
    accessSpreadsheet
})