// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const geolib = require("geolib");
const fs = require("fs");
const bodyParser = require("body-parser");
const url = require("url");
const requestPromise = require("request-promise");
const gsheets = require("./spreadsheet");
const dialogflow = require("./dialogflow");

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


const getStats = async function(Municipality, Province){
  var sheetData = await gsheets.accessSpreadsheet(Municipality, Province);

  if (sheetData.walangLaman) return false;

  const {Frequency, Died, Recovered, Date} = sheetData;
  const Muni_Province = (Province && !(Municipality)) ? sheetData["Province"] : sheetData['Muni, Province'];
  const Active = sheetData['Active (Positive-Recovered-Died)'];

  var MunicipalityString = `Here are the COVID-19 statistics for ${Muni_Province} as of ${Date}:\n\n`;
  var FrequencyString = `Total Cases: ${Frequency || '0'}\n`;
  var DiedString = `Deaths: ${Died || '0'}\n`;
  var RecoveredString = `Recoveries: ${Recovered || '0'}\n`;
  var ActiveString = `Active Cases: ${Active || '0'}`;

  var message = MunicipalityString + FrequencyString + DiedString + RecoveredString + ActiveString;
  
  return message;
}


var contents = fs.readFileSync("listOfHospitals.json");
// Define to JSON type
const hospitalLocations = JSON.parse(contents);


const findNearestHospital = (latitude, longitude) => {
  const locations = hospitalLocations.map(location => {
    const distance = geolib.getDistance({
      latitude,
      longitude
    }, {
      latitude: location.LATITUDE,
      longitude: location.LONGITUDE
    });
    
    return Object.assign({}, location, {distance});
  });
  return locations;
};

const formatIntoMessage = (hospital) => {
  const name = hospital.Hospital;
  const contact = hospital.Contact ? hospital.Contact : "No contact details available.";
  const address = hospital.Address;
  
  // text style
  // const message = `${name}\n\n${address}\n\n${contact}`;
  // return message;
  
  // gallery style
  const title = name;
  const subtitle= `${address}\n\n${contact}`;
  
  return {title, subtitle};
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.json({
    message: "Hello! Stay safe :D",
  });
});

// app.get("/show-webview", (request, response) => {
//   response.sendFile(__dirname + '/views/show-webview.html');
// })
// Get user's location using latitude and longitude
app.get('/nearest', (request, response) => {
  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  
  const locations = findNearestHospital(latitude, longitude);
  
  locations.sort((locationA, locationB) => {
    const distanceA = locationA.distance;
    const distanceB = locationB.distance;
    
    if (distanceA < distanceB) return -1;
    if (distanceA > distanceB) return 1;
  });
  
  const hospital1 = formatIntoMessage(locations[0]);
  const hospital2 = formatIntoMessage(locations[1]);
  const hospital3 = formatIntoMessage(locations[2]);
  const hospital4 = formatIntoMessage(locations[3]);
  const hospital5 = formatIntoMessage(locations[4]);
  
  // text style
  // response.json({
  //   messages: [
  //     {text: hospital1},
  //     {text: hospital2},
  //     {text: hospital3},
  //     {text: hospital4},
  //     {text: hospital5},
  //   ]
  // })
  
  // gallery style
  response.json({
    messages: [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [
              {
                title: hospital1.title,
                subtitle: hospital1.subtitle,
              },  
              {
                title: hospital2.title,
                subtitle: hospital2.subtitle,
              },  
              {
                title: hospital3.title,
                subtitle: hospital3.subtitle,
              },  
              {
                title: hospital4.title,
                subtitle: hospital4.subtitle,
              },  
              {
                title: hospital5.title,
                subtitle: hospital5.subtitle,
              },  
            ],
          }
        }
      }
    ]
  });
})



app.post('/broadcast-to-chatfuel', (request, response) => {
  
  const curr_lat = request.body.latitude;
  const curr_long = request.body.longitude;
  const userId = request.body.userId;
  
  const botId = process.env.CHATFUEL_BOT_ID;
  const chatfuelToken = process.env.CHATFUEL_TOKEN;
  
  console.log(userId);
  const blockName = "Hospitals / Location Results";
  const broadcastApiUrl = `https://api.chatfuel.com/bots/${botId}/users/${userId}/send`;
  
  const query = Object.assign(
    {
    chatfuel_token: chatfuelToken, 
    chatfuel_block_name: blockName,
    }, 
    {
      curr_lat,
      curr_long
    }
  );
  
  const chatfuelApiUrl = url.format({
    pathname: broadcastApiUrl,
    query
  })
  
  const options = {
    uri: chatfuelApiUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  requestPromise.post(options)
    .then(()=> {
    response.json({});
  })
})

const createButtons = (displayUrl) => {
  return  {messages: [
    {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'I hope this is not an urgent need. Where are you located right now?',
          buttons: [
            {
              title: "Share Location",
              type: "web_url",
              url: displayUrl,
              messenger_extensions: true,
              webview_height_ratio: "tall",
            },
          ],
        }
      }
    }
  ]}
};

app.get('/show-buttons', (request, response) => {
  const {userId} = request.query;
  
  const displayUrl = `https://endcov-hospitals-api.herokuapp.com/show-webview?userId=${userId}`;

  response.json(createButtons(displayUrl)); 
});

app.get('/show-webview', (request, response) => {
  const {userId} = request.query;
  response.render('webview', {pageTitle: "Share Location", userId});
})


app.get('/get-stats', async (request, response) => {

  const Municipality = request.query.Municipality;
  const Province = request.query.Province;
  
  var message = await getStats(Municipality, Province);

  if (!message) {
    response.json({
      redirect_to_blocks: ["Default Fallback"],
    })
  }
  response.json({
    messages: [
      {text: message},
    ]
  });
})

app.post("/dialogflow", async (req, res) => {
  const queryText = req.body.queryText;
  
  var data;
  
  const {redirect_to_blocks, city_municipality, province} = await dialogflow.runDialogflow(queryText);

  if (city_municipality && province) {
    data = {
      set_attributes: {
        city_statistic: city_municipality,
        province_statistic: province
      },
      redirect_to_blocks
    }
  } else if (city_municipality) {
    data = {
      set_attributes: {
        city_statistic: city_municipality,
        province_statistic: null,
      },
      redirect_to_blocks
    };
  } else if(province_statistic) {
    data = {
      set_attributes: {
        city_statistic: null,
        province_statistic: province,
      },
      redirect_to_blocks
    };
  } else {
    data = {redirect_to_blocks};
  }
  res.json(data);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
